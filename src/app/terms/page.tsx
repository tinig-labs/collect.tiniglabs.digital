import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { A, LegalPage, List, Mail, P, Section } from "@/components/legal";

export const dynamic = "force-static";

const title = "Terms of Service";
export const metadata: Metadata = {
  title,
  description: "The terms for recording and reviewing on the tinig labs speech corpus.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title={title}
      lede={
        <>
          These terms apply when you create an account, record, or review on collect.tiniglabs.digital. By using the
          site, you agree to them.
        </>
      }
    >
      <Section id="who" title="Who we are">
        <P>
          <Brand /> (&ldquo;we&rdquo;) is an independent lab run by one developer. It releases open models, datasets,
          and tools. This site collects recordings for an open Tagalog speech corpus.
        </P>
      </Section>

      <Section id="development" title="Under development">
        <P>
          The site is still being built and is in a closed beta: contributing needs an invite code. Features may change
          or break, and recordings made during this period may be reset before the first public release.
        </P>
      </Section>

      <Section id="accounts" title="Your account">
        <P>
          You must be 18 or older. Keep your password to yourself, and tell us if you think someone else has used your
          account. One person, one account.
        </P>
      </Section>

      <Section id="recordings" title="Your recordings">
        <P>When you submit a recording, you confirm that:</P>
        <List>
          <li>the voice is yours, and you read the prompt shown</li>
          <li>no one else can be heard, and nothing private is said</li>
          <li>you release the recording under CC0, so anyone may use it for any purpose</li>
        </List>
        <P>
          You can ask us to remove your recordings at any time. We take them out of the corpus and future releases, but
          copies already published can&apos;t be recalled. The <A href="/privacy">Privacy Policy</A> explains how this
          works.
        </P>
      </Section>

      <Section id="reviews" title="Reviewing transcriptions">
        <P>
          Reviewing is for invited speech-language pathologists, linguists and other speech professionals. Invite codes
          are personal, so don&apos;t share them. You release your transcriptions and corrections under CC0, like the
          recordings.
        </P>
      </Section>

      <Section id="use" title="Using the site">
        <P>When you use the site, don&apos;t:</P>
        <List>
          <li>submit recordings of someone else, or synthetic or altered speech</li>
          <li>upload or review automatically or in bulk</li>
          <li>try to break, overload, or get unauthorized access to the site</li>
          <li>pretend to be tinig labs or someone else</li>
        </List>
        <P>We may remove contributions or close accounts that break these terms.</P>
      </Section>

      <Section id="content" title="Prompts and model output">
        <P>
          The prompts come from open sources, each under its own license. The <A href="/sources">Sources</A> page lists
          them with attribution. The suggested IPA comes from a model licensed CC BY-NC-SA 4.0, and that license covers
          its raw output.
        </P>
      </Section>

      <Section id="not-advice" title="Not clinical advice">
        <P>
          Recording here isn&apos;t a speech assessment, and transcriptions aren&apos;t a diagnosis. For speech concerns,
          see a licensed speech-language pathologist.
        </P>
      </Section>

      <Section id="warranty" title="No warranty">
        <P>
          The site is provided as is. We work to keep it accurate and available, but we don&apos;t guarantee that it will
          be error-free or always online.
        </P>
      </Section>

      <Section id="liability" title="Limit of liability">
        <P>
          As far as the law allows, tinig labs isn&apos;t liable for indirect, incidental, or consequential losses that
          come from using the site.
        </P>
      </Section>

      <Section id="changes" title="Changes to these terms">
        <P>
          When we change these terms, we&apos;ll update the date at the top. If you keep using the site after a change,
          the new terms apply.
        </P>
      </Section>

      <Section id="law" title="Governing law">
        <P>These terms are governed by the laws of the Republic of the Philippines.</P>
      </Section>

      <Section id="contact" title="Contact">
        <P>
          Questions about these terms go to <Mail />.
        </P>
      </Section>
    </LegalPage>
  );
}
