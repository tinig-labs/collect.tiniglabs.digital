/** Resample with the browser's own resampler (OfflineAudioContext), then encode 16-bit PCM WAV. */
export async function toWav16k(chunks: Float32Array[], inputRate: number, targetRate: number) {
  const length = chunks.reduce((n, c) => n + c.length, 0);
  const input = new Float32Array(length);
  let o = 0;
  for (const c of chunks) { input.set(c, o); o += c.length; }

  let samples = input;
  if (inputRate !== targetRate) {
    const outLen = Math.ceil((length * targetRate) / inputRate);
    const ctx = new OfflineAudioContext(1, outLen, targetRate);
    const buf = ctx.createBuffer(1, length, inputRate);
    buf.copyToChannel(input, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
    samples = (await ctx.startRendering()).getChannelData(0);
  }

  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  str(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); str(8, "WAVE");
  str(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, targetRate, true); view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  str(36, "data"); view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return {
    blob: new Blob([view], { type: "audio/wav" }),
    durationMs: Math.round((samples.length / targetRate) * 1000),
  };
}
