"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IpaKeyboard } from "@/components/ipa-keyboard/ipa-keyboard";
import { Button, ButtonLink, Kbd } from "@/components/ui";
import { AudioPlayer } from "@/components/audio-player";
import type { ReviewItem } from "@/app/api/review/next/route";

type Action = "approve" | "correct" | "bad_audio" | "skip";

export function ReviewSession() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Draft is tied to the item it was typed for, so moving to the next item resets it without an effect.
  const [draft, setDraft] = useState<{ id: string; ipa: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const audio = useRef<HTMLAudioElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const fetching = useRef(false);
  const item = queue[0];
  const ipa = item && draft?.id === item.id ? draft.ipa : (item?.modelIpa ?? "");
  const setIpa = useCallback((v: string) => item && setDraft({ id: item.id, ipa: v }), [item]);
  const edited = item ? ipa.normalize("NFD").trim() !== item.modelIpa.normalize("NFD").trim() : false;

  const load = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const res = await fetch("/api/review/next");
      if (!res.ok) throw new Error();
      const { items } = (await res.json()) as { items: ReviewItem[] };
      setQueue((q) => {
        const seen = new Set(q.map((i) => i.id));
        return [...q, ...items.filter((i) => !seen.has(i.id))];
      });
    } catch {
      setMsg("Could not load items.");
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, []);

  // Fetching from our API is a legitimate effect; state is only set after the request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!loading && queue.length > 0 && queue.length <= 2) void load(); }, [queue.length, loading, load]);

  // Warm the browser cache with the next clip (served from the CDN, so this is free).
  useEffect(() => {
    const next = queue[1];
    if (next) new Audio(next.audioUrl).preload = "auto";
  }, [queue]);

  const send = useCallback(
    async (action: Action) => {
      if (!item || busy) return;
      if ((action === "approve" || action === "correct") && !ipa.trim()) return setMsg("Enter a transcription.");
      setBusy(true);
      try {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ recordingId: item.id, action, ipa }),
        });
        if (!res.ok && res.status !== 409) throw new Error();
        if (action !== "skip") setDone((n) => n + 1);
        setMsg(null);
        setQueue((q) => q.slice(1));
      } catch {
        setMsg("Could not save. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [item, ipa, busy],
  );

  const play = () => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = 0;
    void a.play();
  };

  // Ctrl/⌘+Enter submit, Ctrl/⌘+P replay (typing in the field stays normal).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "Enter") { e.preventDefault(); void send(edited ? "correct" : "approve"); }
      else if (mod && e.key.toLowerCase() === "p") { e.preventDefault(); play(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [send, edited]);

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!item) {
    return (
      <div className="mx-auto max-w-md space-y-2 pt-8 text-center">
        <h1 className="font-medium">Nothing to review right now</h1>
        <p className="text-sm text-muted">New recordings are transcribed by the model in batches. Check back later.</p>
        <div className="flex justify-center gap-2 pt-3">
          <Button variant="secondary" onClick={() => { setLoading(true); void load(); }}>Refresh</Button>
          <ButtonLink href="/review/history" variant="ghost">Your reviews</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">IPA review</h1>
          <span className="text-sm text-muted tabular-nums sm:hidden">{done} this session</span>
        </div>
        <div className="-ml-4 flex items-center gap-1 sm:ml-0 sm:gap-3">
          <span className="hidden text-sm text-muted tabular-nums sm:inline">{done} reviewed this session</span>
          <ButtonLink href="/guide#conventions" variant="ghost" className="h-9 rounded-full px-4">
            Guide
          </ButtonLink>
          <ButtonLink href="/review/history" variant="secondary" className="h-9 rounded-full px-4">
            Your reviews
          </ButtonLink>
        </div>
      </div>

      <div className="rounded-lg bg-card ring-1 ring-inset ring-border">
        <div className="space-y-4 p-5 sm:p-8">
          <div className="text-xs text-muted">Prompt ({item.kind})</div>
          <p className="text-xl font-medium">{item.text}</p>
          <AudioPlayer key={item.id} src={item.audioUrl} audioRef={audio} rates={[0.75, 1]} rate={rate} onRateChange={setRate} label="Clip" />
        </div>

        <div className="space-y-3 border-t border-border p-4 sm:p-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
            <label htmlFor="ipa" className="text-sm font-medium">Transcription</label>
            <span className="break-words text-xs text-muted sm:truncate">
              Model: <span className="ipa text-text">{item.modelIpa || "—"}</span>
            </span>
          </div>
          <textarea
            id="ipa"
            ref={field}
            value={ipa}
            onChange={(e) => setIpa(e.target.value)}
            rows={2}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="ipa w-full resize-y rounded-md bg-card px-4 py-3 text-2xl leading-relaxed ring-1 ring-inset ring-[var(--tinta)]/15 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <IpaKeyboard value={ipa} onChange={setIpa} targetRef={field} />
        </div>

        {/* Sticky above the phone tab bar, so the decision is always one tap away. */}
        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center gap-2 rounded-b-lg border-t border-border bg-card p-3 sm:static sm:p-5">
          {edited ? (
            <Button onClick={() => void send("correct")} disabled={busy} className="flex-1 sm:flex-none">Submit correction</Button>
          ) : (
            <Button onClick={() => void send("approve")} disabled={busy} className="flex-1 sm:flex-none">Approve</Button>
          )}
          {edited && <Button variant="secondary" onClick={() => setIpa(item.modelIpa)} disabled={busy}>Reset</Button>}
          <Button variant="danger" onClick={() => void send("bad_audio")} disabled={busy}>Bad audio</Button>
          <Button variant="ghost" onClick={() => void send("skip")} disabled={busy} className="px-3 sm:ml-auto sm:px-5">Skip</Button>
        </div>
      </div>

      {msg && <p role="alert" className="text-sm text-danger">{msg}</p>}
      <p className="hidden text-center text-xs text-muted sm:block">
        <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> submit · <Kbd>Ctrl</Kbd> + <Kbd>P</Kbd> replay
      </p>
    </div>
  );
}
