/**
 * Imports Tagalog prompts from open-source corpora. Nothing here is authored by us.
 *
 *   npm run import-corpus             # download (cached in ./data) and insert into DATABASE_URL
 *   npm run import-corpus -- --dry    # parse only, print counts and samples
 *
 * Sources
 *   tatoeba       Tatoeba per-language export (tgl)            CC BY 2.0 FR, author kept
 *   common_voice  Common Voice sentence collector (tl)          CC0 1.0
 *   wiktionary    Wiktionary via kaikki.org (Tagalog headwords) CC BY-SA 4.0
 */
import "dotenv/config";
import { createReadStream, createWriteStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import bz2 from "unbzip2-stream";

const DATA_DIR = "data";
const DRY = process.argv.includes("--dry");

const SOURCES = {
  tatoeba: {
    url: "https://downloads.tatoeba.org/exports/per_language/tgl/tgl_sentences_detailed.tsv.bz2",
    file: "tatoeba_tgl.tsv.bz2",
    license: "CC BY 2.0 FR",
  },
  common_voice: {
    url: "https://raw.githubusercontent.com/common-voice/common-voice/main/server/data/tl/sentence-collector.txt",
    file: "common_voice_tl.txt",
    license: "CC0 1.0",
  },
  wiktionary: {
    url: "https://kaikki.org/dictionary/Tagalog/kaikki.org-dictionary-Tagalog.jsonl",
    file: "kaikki_tagalog.jsonl",
    license: "CC BY-SA 4.0",
  },
} as const;

type Source = keyof typeof SOURCES;
type Row = {
  text: string;
  kind: "sentence" | "word";
  source: Source;
  sourceId: string | null;
  sourceAuthor: string | null;
  license: string;
};

// ---------- helpers ----------

async function download(src: Source) {
  const { url, file } = SOURCES[src];
  const path = `${DATA_DIR}/${file}`;
  if (existsSync(path) && statSync(path).size > 0) return path;
  mkdirSync(DATA_DIR, { recursive: true });
  console.log(`↓ ${url}`);
  const res = await fetch(url, { headers: { "user-agent": "tagalog-speech-corpus-importer" } });
  if (!res.ok || !res.body) throw new Error(`${src}: HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(path));
  return path;
}

function lines(path: string, decompress = false) {
  const raw = createReadStream(path);
  return createInterface({ input: decompress ? raw.pipe(bz2()) : raw, crlfDelay: Infinity });
}

const LETTERS = /^[\p{Script=Latin}\s'’\-.,!?;:"“”()]+$/u; // Latin script + basic punctuation only
const HAS_DIGIT_OR_URL = /\d|https?:|www\.|@|#/i;

function cleanSentence(s: string): string | null {
  let t = s.normalize("NFC").replace(/\s+/g, " ").trim();
  t = t.replace(/^["“'‘]+|["”'’]+$/g, "").trim(); // strip wrapping quotes
  t = t.replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
  if (!t || HAS_DIGIT_OR_URL.test(t) || !LETTERS.test(t)) return null;
  const words = t.split(" ").filter((w) => /\p{L}/u.test(w));
  if (words.length < 2 || words.length > 14) return null;
  if (t.length > 120) return null;
  if (t.includes('"')) return null; // quoted text is usually a foreign phrase (e.g. English)
  if (/[,;:\-]$/.test(t)) return null; // fragment or poem line
  return t[0].toUpperCase() + t.slice(1);
}

const WORD_RE = /^[\p{Script=Latin}][\p{Script=Latin}'\-]{1,24}$/u;
const SKIP_POS = new Set([
  "name", "character", "symbol", "prefix", "suffix", "infix", "circumfix", "affix",
  "interfix", "abbrev", "punct", "phrase", "proverb", "contraction", "romanization",
]);

// ---------- parsers ----------

async function parseTatoeba(): Promise<Row[]> {
  const out: Row[] = [];
  // columns: id, lang, text, username, date_added, date_last_modified
  for await (const line of lines(await download("tatoeba"), true)) {
    const [id, lang, text, user] = line.split("\t");
    if (lang !== "tgl" || !text) continue;
    const t = cleanSentence(text);
    if (!t) continue;
    out.push({
      text: t, kind: "sentence", source: "tatoeba", sourceId: id,
      sourceAuthor: user && user !== "\\N" ? user : null, license: SOURCES.tatoeba.license,
    });
  }
  return out;
}

async function parseCommonVoice(): Promise<Row[]> {
  const out: Row[] = [];
  let n = 0;
  for await (const line of lines(await download("common_voice"))) {
    n++;
    const t = cleanSentence(line);
    if (!t) continue;
    out.push({
      text: t, kind: "sentence", source: "common_voice", sourceId: `sentence-collector:${n}`,
      sourceAuthor: null, license: SOURCES.common_voice.license,
    });
  }
  return out;
}

type KaikkiEntry = {
  word: string;
  pos: string;
  lang_code?: string;
  senses?: { tags?: string[]; form_of?: unknown[] }[];
};

async function parseWiktionary(): Promise<Row[]> {
  const out: Row[] = [];
  for await (const line of lines(await download("wiktionary"))) {
    if (!line) continue;
    let e: KaikkiEntry;
    try { e = JSON.parse(line); } catch { continue; }
    if (e.lang_code && e.lang_code !== "tl") continue;
    if (SKIP_POS.has(e.pos)) continue;
    const w = e.word.normalize("NFC").trim();
    if (!WORD_RE.test(w) || w !== w.toLowerCase()) continue; // drops proper nouns & acronyms
    if (w.startsWith("-") || w.endsWith("-")) continue; // affixes
    const senses = e.senses ?? [];
    const allFormOf = senses.length > 0 && senses.every((s) => s.form_of || s.tags?.includes("form-of"));
    if (allFormOf) continue; // keep lemmas only
    if (senses.every((s) => s.tags?.some((t) => ["obsolete", "archaic", "misspelling"].includes(t)))) continue;
    out.push({
      text: w, kind: "word", source: "wiktionary", sourceId: w,
      sourceAuthor: "Wiktionary contributors", license: SOURCES.wiktionary.license,
    });
  }
  return out;
}

// ---------- main ----------

function dedupe(rows: Row[]) {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = `${r.kind}:${r.text.toLowerCase().replace(/[.,!?;:"]+$/g, "")}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function main() {
  const results = await Promise.allSettled([parseTatoeba(), parseCommonVoice(), parseWiktionary()]);
  const names: Source[] = ["tatoeba", "common_voice", "wiktionary"];
  const all: Row[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      console.log(`${names[i].padEnd(13)} ${r.value.length} rows`);
      all.push(...r.value);
    } else {
      console.warn(`${names[i].padEnd(13)} skipped: ${(r.reason as Error).message}`);
    }
  });
  // CC0 first so duplicates keep the least restrictive licence.
  const order: Record<Source, number> = { common_voice: 0, tatoeba: 1, wiktionary: 2 };
  const rows = dedupe(all.sort((a, b) => order[a.source] - order[b.source]));
  console.log(`total after dedupe: ${rows.length}`);

  if (DRY) {
    for (const s of names) {
      console.log(`\n${s}:`);
      rows.filter((r) => r.source === s).slice(0, 5).forEach((r) => console.log(`  ${r.text}`));
    }
    return;
  }

  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const { prompts } = await import("../src/db/schema");
  const db = drizzle(neon(process.env.DATABASE_URL!));
  const CHUNK = 1000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.insert(prompts).values(rows.slice(i, i + CHUNK)).onConflictDoNothing();
    process.stdout.write(`\rinserted ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }
  console.log("\ndone");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
