import type { Metadata } from "next";
import { publicPage } from "@/lib/seo";
import type { ReactNode } from "react";
import { Kbd } from "@/components/ui";
import { A, List, P, Section } from "@/components/legal";
import { REVIEWS_TO_FINALIZE } from "@/lib/constants";

export const dynamic = "force-static";

export const metadata: Metadata = publicPage({
  title: "Guide",
  description: "How to record clean clips, and the IPA conventions reviewers follow for Tagalog.",
  path: "/guide",
});

const TOC = [
  { id: "recording", label: "Recording" },
  { id: "conventions", label: "Transcription conventions" },
  { id: "consonants", label: "Consonants" },
  { id: "vowels", label: "Vowels" },
  { id: "stress", label: "Stress and the glottal stop" },
  { id: "actions", label: "Approve, correct or flag" },
  { id: "keyboard", label: "Keyboard and shortcuts" },
];

const Ipa = ({ children }: { children: ReactNode }) => <span className="font-ipa text-[1.05em] text-text">{children}</span>;

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-md bg-surface p-2">
      <table className="w-full min-w-[30rem] rounded-sm bg-card text-left text-sm">
        <thead className="text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border border-t border-border">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3 align-top leading-relaxed">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="pt-2 sm:pt-6">
      <h1 className="text-[clamp(2.25rem,10vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[3.25rem]">Guide</h1>
      <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">
        How to record clips that are useful for research, and the conventions reviewers follow so that independent
        transcriptions of the same clip come out identical.
      </p>

      <div className="mt-14 grid gap-12 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <nav aria-label="On this page" className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <p className="text-sm font-medium text-muted">On this page</p>
          <ol className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 lg:flex-col lg:gap-1">
            {TOC.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="block whitespace-nowrap rounded-full bg-card px-3.5 py-2 text-sm font-medium text-text/75 hover:bg-surface hover:text-text lg:rounded-sm lg:bg-transparent">
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 max-w-[68ch] leading-relaxed text-text/85">
          <Section id="recording" title="Recording">
            <P>Each clip is one prompt, read once. A few habits make every clip usable:</P>
            <List>
              <li>Record in a quiet room. Turn off fans and the TV, and close the window if there&apos;s traffic.</li>
              <li>Keep the microphone about a hand&apos;s width (15–20 cm) from your mouth, slightly to the side.</li>
              <li>Read the prompt exactly as written, at your normal pace and in your normal voice.</li>
              <li>Wait half a second after pressing Record before speaking, and after finishing before pressing Stop.</li>
              <li>If you stumble, cough, or someone talks over you, press Re-record. Play the take back before you submit.</li>
              <li>If you don&apos;t know how to say a word, press Skip. Guessing hurts the data more than skipping.</li>
            </List>
            <P>
              Clips are capped at 15 seconds. Switching between Mixed, Sentences and Words discards an unsent take, so
              submit or re-record first.
            </P>
          </Section>

          <Section id="conventions" title="Transcription conventions">
            <P>
              The model suggests an IPA transcription for each clip. A clip is verified once {REVIEWS_TO_FINALIZE}{" "}
              reviewers submit the same transcription, character for character, so these rules matter more than
              personal style.
            </P>
            <List>
              <li>
                <span className="font-medium text-text">Transcribe what was said,</span> not the dictionary form. If the
                speaker says <Ipa>ɾito</Ipa> for <em>dito</em>, write <Ipa>ɾ</Ipa>.
              </li>
              <li>
                <span className="font-medium text-text">Separate words with one space,</span> following the word breaks
                in the prompt. Don&apos;t mark syllable breaks or add punctuation.
              </li>
              <li>
                <span className="font-medium text-text">Keep it broad.</span> Use the symbols in the tables below. Leave
                out aspiration, nasalization and other fine diacritics unless the guide asks for them.
              </li>
              <li>
                Use the IPA <Ipa>ɡ</Ipa> (U+0261), not the keyboard g. The on-screen keyboard inserts the right one.
              </li>
              <li>
                Write affricates as two letters without a tie bar: <Ipa>tʃ</Ipa> and <Ipa>dʒ</Ipa>.
              </li>
            </List>
          </Section>

          <Section id="consonants" title="Consonants">
            <Table
              head={["Spelling", "IPA", "Example", "Notes"]}
              rows={[
                ["p b t d k g", <Ipa key="i">p b t d k ɡ</Ipa>, <><em>bata</em> <Ipa>ˈbataʔ</Ipa></>, "Unaspirated; don't mark aspiration."],
                ["ng", <Ipa key="i">ŋ</Ipa>, <><em>ngayon</em> <Ipa>ŋaˈjon</Ipa></>, "Also inside mga: mɐˈŋa."],
                ["m n", <Ipa key="i">m n</Ipa>, <><em>mano</em> <Ipa>ˈmano</Ipa></>, ""],
                ["s h", <Ipa key="i">s h</Ipa>, <><em>hapon</em> <Ipa>ˈhapon</Ipa></>, ""],
                ["l", <Ipa key="i">l</Ipa>, <><em>lima</em> <Ipa>liˈma</Ipa></>, ""],
                ["r", <Ipa key="i">ɾ</Ipa>, <><em>araw</em> <Ipa>ˈʔaɾaw</Ipa></>, "A tap. Use r only for a clearly trilled r."],
                ["w y", <Ipa key="i">w j</Ipa>, <><em>bahay</em> <Ipa>ˈbahaj</Ipa></>, "Including the second half of aw, ay, iw, oy."],
                ["ts, ch", <Ipa key="i">tʃ</Ipa>, <><em>tsinelas</em> <Ipa>tʃiˈnɛlas</Ipa></>, "Loanwords."],
                ["dy, j", <Ipa key="i">dʒ</Ipa>, <><em>dyip</em> <Ipa>dʒip</Ipa></>, "Loanwords."],
                ["sy, sh", <Ipa key="i">ʃ</Ipa>, <><em>siyempre</em> <Ipa>ʃɛmˈpɾɛ</Ipa></>, "When spoken as one sound."],
                ["f v z", <Ipa key="i">f v z</Ipa>, <><em>Filipino</em> <Ipa>filiˈpino</Ipa></>, "Only if the speaker actually says them; many say p b s."],
              ]}
            />
          </Section>

          <Section id="vowels" title="Vowels">
            <P>
              Tagalog has five vowel phonemes, but the sounds vary with stress and speaker. Write the quality you hear:
            </P>
            <Table
              head={["Spelling", "IPA", "When"]}
              rows={[
                ["a", <Ipa key="i">a</Ipa>, <>Stressed, and most unstressed syllables</>],
                ["a", <Ipa key="i">ɐ</Ipa>, <>Clearly reduced unstressed a, as in <em>mga</em> <Ipa>mɐˈŋa</Ipa></>],
                ["e", <Ipa key="i">ɛ</Ipa>, <>The usual Tagalog e: <em>bente</em> <Ipa>ˈbɛntɛ</Ipa></>],
                ["i", <Ipa key="i">i</Ipa>, <>Including unstressed i that sounds like e; write <Ipa>ɛ</Ipa> only if clearly e</>],
                ["o, u", <Ipa key="i">o</Ipa>, <>Mid back vowel: <em>oo</em> <Ipa>ʔoˈʔo</Ipa></>],
                ["u, o", <Ipa key="i">u</Ipa>, <>High back vowel: <em>ulo</em> <Ipa>ˈʔulo</Ipa></>],
              ]}
            />
            <P>Don&apos;t mark vowel length with ː. Stress already captures it.</P>
          </Section>

          <Section id="stress" title="Stress and the glottal stop">
            <P>Both change meaning in Tagalog, so mark them every time.</P>
            <List>
              <li>
                Put <Ipa>ˈ</Ipa> before the stressed syllable of every word with two or more syllables:{" "}
                <em>baka</em> (cow) <Ipa>ˈbaka</Ipa>, <em>baka</em> (maybe) <Ipa>baˈkaʔ</Ipa>. Leave one-syllable words
                unmarked.
              </li>
              <li>
                Write <Ipa>ʔ</Ipa> at the start of a word that begins with a vowel (<Ipa>ˈʔaso</Ipa>), between vowels
                (<em>maaari</em> <Ipa>maʔaˈʔaɾi</Ipa>), and at the end of words that end in a glottal stop (
                <em>bata</em> <Ipa>ˈbataʔ</Ipa>, <em>wala</em> <Ipa>waˈlaʔ</Ipa>).
              </li>
              <li>
                Inside a sentence, a word-final <Ipa>ʔ</Ipa> often disappears before the next word. Only write it if you
                hear it.
              </li>
            </List>
          </Section>

          <Section id="actions" title="Approve, correct or flag">
            <Table
              head={["Choose", "When"]}
              rows={[
                [<span key="a" className="font-semibold">Approve</span>, "The model's IPA already follows this guide exactly. Approving submits it unchanged."],
                [<span key="c" className="font-semibold">Submit correction</span>, "Anything is off: a sound, a stress mark, a missing ʔ, or a word break. Edit the field, then submit."],
                [<span key="b" className="font-semibold text-danger">Bad audio</span>, "Noise, clipping, silence, another voice, or a reading that doesn't match the prompt. Two flags remove the clip."],
                [<span key="s" className="font-semibold">Skip</span>, "You aren't sure. Another reviewer will get it. Skips aren't counted."],
              ]}
            />
            <P>
              The model often runs words together and leaves out stress and glottal stops. Treat its output as a draft:
              check every word against the audio before approving.
            </P>
          </Section>

          <Section id="keyboard" title="Keyboard and shortcuts">
            <List>
              <li>The on-screen keyboard inserts at the cursor, so you can fix one sound without retyping the word.</li>
              <li>Diacritics such as <Ipa>◌̃</Ipa> attach to the character before the cursor. Backspace removes a whole letter with its marks.</li>
              <li>You can keep typing ordinary letters on your physical keyboard at the same time.</li>
              <li>
                <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> submits, and <Kbd>Ctrl</Kbd> + <Kbd>P</Kbd> replays the clip. Use
                0.75× for fast speech.
              </li>
              <li>
                While recording: <Kbd>Space</Kbd> records and stops, <Kbd>Enter</Kbd> submits, <Kbd>R</Kbd> re-records and{" "}
                <Kbd>S</Kbd> skips.
              </li>
            </List>
            <P>
              Something in this guide unclear or wrong for your dialect? <A href="/contact">Tell us</A>, and we&apos;ll
              update it.
            </P>
          </Section>
        </article>
      </div>
    </div>
  );
}
