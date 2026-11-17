"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_RECORDING_MS, TARGET_SAMPLE_RATE } from "@/lib/constants";
import { toWav16k } from "./wav";

export type RecorderState = "idle" | "starting" | "recording" | "processing" | "recorded";

export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string; durationMs: number } | null>(null);

  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const chunks = useRef<Float32Array[]>([]);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep one mic stream for the whole session instead of re-prompting each prompt.
  const ensureStream = useCallback(async () => {
    if (stream.current?.active) return stream.current;
    stream.current = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    return stream.current;
  }, []);

  const stop = useCallback(async () => {
    if (!ctx.current) return;
    if (timer.current) clearInterval(timer.current);
    setState("processing");
    const rate = ctx.current.sampleRate;
    await ctx.current.close();
    ctx.current = null;
    setLevel(0);
    const { blob, durationMs } = await toWav16k(chunks.current, rate, TARGET_SAMPLE_RATE);
    chunks.current = [];
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { blob, url: URL.createObjectURL(blob), durationMs };
    });
    setState("recorded");
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setState("starting");
    try {
      const s = await ensureStream();
      const ac = new AudioContext();
      await ac.audioWorklet.addModule("/worklets/pcm-capture.js");
      const node = new AudioWorkletNode(ac, "pcm-capture");
      node.port.onmessage = (e: MessageEvent<{ pcm: Float32Array; rms: number }>) => {
        chunks.current.push(e.data.pcm);
        setLevel(Math.min(1, e.data.rms * 4));
      };
      ac.createMediaStreamSource(s).connect(node);
      ctx.current = ac;
      chunks.current = [];
      startedAt.current = performance.now();
      setElapsed(0);
      timer.current = setInterval(() => {
        const ms = performance.now() - startedAt.current;
        setElapsed(ms);
        if (ms >= MAX_RECORDING_MS) void stop();
      }, 100);
      setState("recording");
    } catch (e) {
      setState("idle");
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Microphone access was blocked. Allow it in your browser settings and try again."
          : "Could not start the microphone.",
      );
    }
  }, [ensureStream, stop]);

  const reset = useCallback(() => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setElapsed(0);
    setState("idle");
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      void ctx.current?.close();
      stream.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  return { state, level, elapsed, error, result, start, stop, reset };
}
