"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRecorder } from "@/components/recorder/use-recorder";
import { Badge, Button, ButtonLink, Kbd } from "@/components/ui";
import { MIN_RECORDING_MS } from "@/lib/constants";
import { AudioPlayer } from "@/components/audio-player";
import type { PromptItem } from "@/app/api/prompts/next/route";

type Kind = "all" | "sentence" | "word";
const SOURCE_LABEL: Record<string, string> = { tatoeba: "Tatoeba", common_voice: "Common Voice", wiktionary: "Wiktionary" };

export function RecordSession() {
  const rec = useRecorder();
  const [kind, setKind] = useState<Kind>("all");
  const [queue, setQueue] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const fetching = useRef(false);
  // The prompt a take was recorded for. A take is only ever submitted against that prompt.
  const takeFor = useRef<number | null>(null);
  const prompt = queue[0];

  const changeKind = (k: Kind) => {
    if (k === kind || rec.state === "recording") return;
    if (rec.state === "recorded") setMsg("Your unsent take was discarded because the prompt changed.");
    else setMsg(null);
    rec.reset();
    takeFor.current = null;
    setLoading(true);
    setKind(k);
  };

  const startTake = useCallback(() => {
    if (!prompt) return;
    takeFor.current = prompt.id;
    setMsg(null);
    void rec.start();
  }, [prompt, rec]);

  const load = useCallback(async (k: Kind, replace = false) => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const res = await fetch(`/api/prompts/next${k === "all" ? "" : `?kind=${k}`}`);
      if (!res.ok) throw new Error();
      const { items } = (await res.json()) as { items: PromptItem[] };
      setQueue((q) => {
        if (replace) return items;
        const seen = new Set(q.map((p) => p.id));
        return [...q, ...items.filter((p) => !seen.has(p.id))];
      });
    } catch {
      setMsg("Could not load prompts. Check your connection.");
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, []);

  // Fetching from our API is a legitimate effect; state is only set after the request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(kind, true); }, [kind, load]);
  // Prefetch the next batch before the queue runs out.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!loading && queue.length > 0 && queue.length <= 3) void load(kind); }, [queue.length, loading, kind, load]);

  const advance = useCallback(() => {
    rec.reset();
    takeFor.current = null;
    setQueue((q) => q.slice(1));
  }, [rec]);

  const submit = useCallback(async () => {
    if (!rec.result || !prompt || submitting) return;
    if (takeFor.current !== prompt.id) {
      rec.reset();
      return setMsg("That take belonged to a different prompt and was discarded. Record this one.");
    }
    if (rec.result.durationMs < MIN_RECORDING_MS) return setMsg("That clip is too short. Record again.");
    setSubmitting(true);
    setMsg(null);
    try {
      const sign = await fetch("/api/recordings/upload-url", { method: "POST" });
      const signed = (await sign.json()) as {
        id: string; key: string; url: string; headers: Record<string, string>; token: string; fallbackUrl?: string; error?: string;
      };
      if (!sign.ok) throw new Error(signed.error);
      const { id, key, url, headers, token, fallbackUrl } = signed;
      const blob = rec.result.blob;
      // Direct-to-R2 first (cheapest); R2 errors carry no CORS headers, so a refusal surfaces as a
      // network error. Either way, retry through the Worker's R2 binding.
      const direct = await fetch(url, { method: "PUT", headers, body: blob }).then((r) => r.ok, () => false);
      if (!direct) {
        if (!fallbackUrl || fallbackUrl === url) throw new Error("Upload failed. Try again.");
        const viaWorker = await fetch(fallbackUrl, { method: "PUT", headers: { "content-type": "audio/wav", "x-upload-token": token }, body: blob })
          .then((r) => r.ok || r.status === 409, () => false);
        if (!viaWorker) throw new Error("Upload failed. Check your connection and try again.");
      }
      const save = await fetch("/api/recordings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, key, token, promptId: prompt.id, durationMs: rec.result.durationMs }),
      });
      if (!save.ok && save.status !== 409) throw new Error(((await save.json()) as { error?: string }).error);
      setDone((n) => n + 1);
      advance();
    } catch (e) {
      setMsg(e instanceof Error && e.message ? e.message : "Upload failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }, [rec, prompt, submitting, advance]);

  // Keyboard: Space record/stop, Enter submit, S skip, R re-record.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.repeat) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (rec.state === "recording") void rec.stop();
        else if (rec.state === "idle" || rec.state === "recorded") startTake();
      } else if (e.key === "Enter" && rec.state === "recorded") {
        e.preventDefault();
        void submit();
      } else if (e.key.toLowerCase() === "s" && rec.state !== "recording") advance();
      else if (e.key.toLowerCase() === "r" && rec.state === "recorded") rec.reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rec, submit, advance, startTake]);

  const seconds = (rec.elapsed / 1000).toFixed(1);
  const recording = rec.state === "recording";
  const busy = rec.state === "starting" || rec.state === "processing";
  // Spoken and shown in words, so the state never depends on colour alone.
  const status = submitting
    ? "Uploading your take…"
    : recording
      ? "Recording"
      : rec.state === "starting"
        ? "Starting the microphone…"
        : rec.state === "processing"
          ? "Saving the take…"
          : rec.state === "recorded"
            ? "Listen back, then submit or re-record"
            : prompt
              ? "Ready to record"
              : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="grid grid-cols-3 gap-1 rounded-full bg-surface p-1 text-sm sm:inline-flex" role="group" aria-label="Prompt type">
          {(["all", "sentence", "word"] as Kind[]).map((k) => (
            <button
              key={k}
              onClick={() => changeKind(k)}
              aria-pressed={kind === k}
              disabled={rec.state === "recording" || submitting}
              title={rec.state === "recorded" && kind !== k ? "Switching discards your unsent take" : undefined}
              className={`rounded-full px-4 py-2 font-semibold capitalize transition-colors disabled:opacity-50 sm:py-1.5 ${kind === k ? "bg-card text-text ring-1 ring-inset ring-accent/25" : "text-text/70 hover:text-text"}`}
            >
              {k === "all" ? "Mixed" : `${k}s`}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm font-medium text-muted tabular-nums">{done} recorded this session</span>
          <ButtonLink href="/record/history" variant="secondary" className="h-9 px-4">
            Your recordings
          </ButtonLink>
        </div>
      </div>

      <div className={`rounded-lg bg-card transition-shadow ${recording ? "ring-2 ring-accent" : "ring-1 ring-border"}`}>
        <div className="flex min-h-56 flex-col items-center justify-center gap-5 px-5 py-10 text-center sm:px-8 sm:py-14">
          {loading ? (
            <span className="text-muted">Loading…</span>
          ) : prompt ? (
            <>
              <p className={`text-balance font-medium tracking-tight ${prompt.kind === "word" ? "text-4xl sm:text-5xl" : "text-2xl leading-snug sm:text-3xl"}`}>
                {prompt.text}
              </p>
              <Badge>{SOURCE_LABEL[prompt.source] ?? prompt.source}</Badge>
            </>
          ) : (
            <span className="text-muted">You have recorded every available prompt. Thank you.</span>
          )}
        </div>

        {/* On phones the controls stay above the tab bar, in reach of a thumb. */}
        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex flex-col items-center gap-4 rounded-b-lg border-t border-border bg-card px-4 py-4 sm:static sm:px-8 sm:py-6">
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <p role="status" aria-live="polite" className="flex min-h-5 items-center gap-2 text-sm font-semibold text-text">
              {status && (
                <span
                  aria-hidden="true"
                  className={`inline-block size-2.5 shrink-0 ${recording ? "animate-pulse rounded-full bg-accent" : rec.state === "recorded" ? "rounded-[2px] bg-accent" : "rounded-full ring-2 ring-inset ring-text/40"}`}
                />
              )}
              {status}
            </p>
            <div className="flex h-5 w-full items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface" aria-hidden>
                <div className="h-full rounded-full bg-accent transition-[width] duration-75" style={{ width: `${rec.level * 100}%` }} />
              </div>
              <span className="w-10 text-right text-xs font-medium text-muted tabular-nums" aria-label={recording ? `${seconds} seconds` : undefined}>
                {seconds}s
              </span>
            </div>
          </div>

          {rec.state === "recorded" && rec.result && (
            <div className="w-full max-w-md">
              <AudioPlayer src={rec.result.url} label="Your take" />
            </div>
          )}

          <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            {rec.state === "recorded" ? (
              <>
                <Button variant="secondary" onClick={rec.reset} className="h-14 text-base sm:h-12 sm:px-6">Re-record</Button>
                <Button onClick={() => void submit()} disabled={submitting} className="h-14 text-base sm:h-12 sm:w-40">
                  {submitting ? "Uploading…" : "Submit"}
                </Button>
              </>
            ) : (
              // One round button for record and stop: the icon, the label and the ring all change, not just the colour.
              <button
                type="button"
                onClick={recording ? () => void rec.stop() : startTake}
                disabled={recording ? false : !prompt || rec.state !== "idle"}
                aria-pressed={recording}
                className={`col-span-2 mx-auto inline-flex h-14 w-full items-center justify-center gap-3 rounded-full px-6 text-base font-semibold transition-[background-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-44 ${
                  recording
                    ? "rec-breathe bg-card text-text ring-2 ring-inset ring-accent hover:bg-surface"
                    : "bg-accent text-accent-fg hover:bg-accent-hover"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-8 items-center justify-center rounded-full ${recording ? "bg-accent" : "bg-white/15"}`}
                >
                  {recording ? (
                    <span className="block size-3 rounded-[3px] bg-white" />
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
                    </svg>
                  )}
                </span>
                {recording ? "Stop" : busy ? "…" : "Record"}
              </button>
            )}
            <Button variant="ghost" onClick={advance} disabled={!prompt || rec.state === "recording"} className="col-span-2 h-10 sm:h-12">
              Skip prompt
            </Button>
          </div>

          {(rec.error || msg) && <p role="alert" className="text-center text-sm text-danger">{rec.error ?? msg}</p>}
        </div>
      </div>

      <p className="hidden text-center text-xs text-muted sm:block">
        <Kbd>Space</Kbd> record / stop · <Kbd>Enter</Kbd> submit · <Kbd>R</Kbd> re-record · <Kbd>S</Kbd> skip
      </p>
    </div>
  );
}
