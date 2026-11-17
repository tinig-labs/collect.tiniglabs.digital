# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright 2026 tinig labs. See modal/LICENSE.
"""
Batch IPA phone recognition for the tinig labs speech corpus, served on Modal.

Model: changelinglab/PhoneticXeus (XEUS encoder + self-conditioned CTC, 0.6B params).
The model weights are third-party and licensed CC BY-NC-SA 4.0 (non-commercial, share-alike);
this file's AGPL license does not cover them.

Contract (must match src/lib/modal.ts):
    POST https://<workspace>--tinig-phonemes-phonemes-web.modal.run/transcribe
    Authorization: Bearer <PHONEMES_TOKEN>
    { "items": [{ "id": "<uuid>", "audio_url": "https://..." }] }
 -> { "model": "changelinglab/PhoneticXeus@<commit>",
      "results": [{ "id": "<uuid>", "ipa": "..." } | { "id": "<uuid>", "error": "..." }] }

Setup:    modal secret create tinig-phonemes PHONEMES_TOKEN=<long random string>
Deploy:   modal deploy modal/phonemes.py
Try one:  modal run modal/phonemes.py --wav path/to/clip.wav
"""

from __future__ import annotations

import modal

MODEL_ID = "changelinglab/PhoneticXeus"
SAMPLE_RATE = 16_000
MAX_ITEMS = 64
MAX_AUDIO_BYTES = 2_000_000  # ~60 s of 16 kHz mono PCM; the site caps clips at 15 s
MIN_SAMPLES = SAMPLE_RATE // 10  # 100 ms

# Only what the remote code loads: skips the duplicate 2.3 GB phoneticxeus_state_dict.pt.
MODEL_FILES = ["*.json", "*.py", "model.safetensors", "pxeus/**"]


def download_model() -> None:
    from huggingface_hub import snapshot_download

    snapshot_download(MODEL_ID, allow_patterns=MODEL_FILES)


# Weights are baked into the image, so cold starts never re-download 2.3 GB.
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libsndfile1")
    .pip_install(
        "torch==2.5.1",
        "torchaudio==2.5.1",
        "transformers>=4.44,<5",
        "huggingface_hub>=0.25",
        "safetensors",
        "soundfile",
        "numpy<2.3",
        "pyyaml",
        "typeguard",
        "httpx",
        "fastapi[standard]",
    )
    .env({"HF_HOME": "/models/hf"})
    .run_function(download_model)
    # The remote code calls snapshot_download at load time; serve it from the baked cache.
    .env({"HF_HUB_OFFLINE": "1"})
)

app = modal.App("tinig-phonemes", image=image)


@app.cls(
    gpu="T4",  # cheapest GPU; 0.6B fp32 fits easily in 16 GB
    secrets=[modal.Secret.from_name("tinig-phonemes")],  # provides PHONEMES_TOKEN
    scaledown_window=60,  # the site calls in batches every 30 min, so release the GPU quickly
    max_containers=1,
    timeout=600,
)
class Phonemes:
    @modal.enter()
    def load(self) -> None:
        import torch
        from huggingface_hub import snapshot_download
        from transformers import AutoModel

        self.torch = torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = AutoModel.from_pretrained(MODEL_ID, trust_remote_code=True).to(self.device).eval()
        # The snapshot directory name is the commit hash: record it so every IPA is traceable.
        snap = snapshot_download(MODEL_ID, allow_patterns=MODEL_FILES)
        self.version = f"{MODEL_ID}@{snap.rstrip('/').split('/')[-1][:12]}"

    def _transcribe(self, data: bytes) -> str:
        import io

        import numpy as np
        import soundfile as sf
        import torchaudio

        wav, sr = sf.read(io.BytesIO(data), dtype="float32", always_2d=True)
        mono = self.torch.from_numpy(np.ascontiguousarray(wav.mean(axis=1)))
        if sr != SAMPLE_RATE:
            mono = torchaudio.functional.resample(mono, sr, SAMPLE_RATE)
        if mono.numel() < MIN_SAMPLES:
            raise ValueError("audio shorter than 100 ms")
        with self.torch.inference_mode():
            out = self.model.transcribe(mono.to(self.device), sampling_rate=SAMPLE_RATE)
        return out[0]["processed_transcript"].strip()

    @modal.method()
    def transcribe_bytes(self, data: bytes) -> dict:
        return {"model": self.version, "ipa": self._transcribe(data)}

    @modal.asgi_app()
    def web(self):
        import asyncio
        import hmac
        import os

        import httpx
        from fastapi import FastAPI, Header, HTTPException

        api = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
        token = os.environ.get("PHONEMES_TOKEN", "")

        async def fetch(client: httpx.AsyncClient, url: str) -> bytes:
            r = await client.get(url)
            r.raise_for_status()
            if len(r.content) > MAX_AUDIO_BYTES:
                raise ValueError("audio too large")
            return r.content

        @api.post("/transcribe")
        async def transcribe(body: dict, authorization: str | None = Header(default=None)):
            if not token or not hmac.compare_digest(authorization or "", f"Bearer {token}"):
                raise HTTPException(status_code=401, detail="unauthorized")

            items = body.get("items")
            if not isinstance(items, list) or not 0 < len(items) <= MAX_ITEMS:
                raise HTTPException(status_code=400, detail=f"items must be a list of 1-{MAX_ITEMS}")
            items = [i for i in items if isinstance(i, dict) and i.get("id") and i.get("audio_url")]

            # Download in parallel, then run the GPU sequentially (one model, one device).
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                blobs = await asyncio.gather(*(fetch(client, i["audio_url"]) for i in items), return_exceptions=True)

            results = []
            for item, data in zip(items, blobs):
                rid = str(item["id"])
                if isinstance(data, BaseException):
                    results.append({"id": rid, "error": f"download failed: {data}"[:300]})
                    continue
                try:
                    results.append({"id": rid, "ipa": self._transcribe(data)})
                except Exception as e:  # one bad clip must not fail the whole batch
                    results.append({"id": rid, "error": f"transcription failed: {e}"[:300]})
            return {"model": self.version, "results": results}

        @api.get("/health")
        async def health():
            return {"ok": True, "model": self.version}

        return api


@app.local_entrypoint()
def main(wav: str):
    """Transcribe one local file on the remote GPU: modal run modal/phonemes.py --wav clip.wav"""
    from pathlib import Path

    print(Phonemes().transcribe_bytes.remote(Path(wav).read_bytes()))
