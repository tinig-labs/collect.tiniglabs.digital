import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { A, DataTable, LegalPage, List, Mail, P, Section } from "@/components/legal";

export const dynamic = "force-static";

const title = "Privacy Policy";
export const metadata: Metadata = {
  title,
  description: "What the tinig labs speech corpus collects when you record or review, and what happens to it.",
  alternates: { canonical: "/privacy" },
};

// Keep in sync with src/db/schema.ts and src/app/api/admin/export/route.ts
const DATA = [
  {
    what: "Name, email address and password",
    when: "You create an account",
    why: "To sign you in and send verification and reset codes",
    kept: "Until you delete your account. Passwords are stored only as a hash",
  },
  {
    what: "Voice recordings",
    when: "You submit a recording",
    why: "To build the public Tagalog speech corpus",
    kept: "Published in the corpus under CC0, so released copies can't be recalled",
  },
  {
    what: "Age range, gender, region and first language",
    when: "You choose to fill them in during onboarding",
    why: "To describe who is speaking, which makes the corpus useful for research",
    kept: "Published with your recordings, never with your name or email",
  },
  {
    what: "IPA transcriptions and review decisions",
    when: "You review as an invited professional",
    why: "To publish verified phonetic transcriptions",
    kept: "The agreed IPA is published; who reviewed it is not",
  },
  {
    what: "Request details: IP address, browser, pages visited",
    when: "You load any page",
    why: "Our host needs them to serve the site, rate-limit uploads and keep it secure",
    kept: "As set by Cloudflare",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title={title}
      lede={
        <>
          This page explains what the <Brand /> speech corpus collects, why, and how to have it deleted. We collect
          as little as we can.
        </>
      }
      summary={
        <DataTable
          rows={DATA}
          note="Your name and email are never published. Sign-in cookies only: no analytics and no ad tracking."
        />
      }
    >
      <Section id="who" title="Who we are">
        <P>
          <Brand /> is an independent lab run by one developer, who decides how your data is used. This policy covers
          collect.tiniglabs.digital and the emails it sends. The main site has its own{" "}
          <A href="https://tiniglabs.digital/privacy">Privacy Policy</A>.
        </P>
      </Section>

      <Section id="voice" title="Your voice">
        <P>
          A voice recording can identify you, so we treat it carefully. When you finish onboarding, you agree that your
          recordings and the optional details you give are released in a public dataset under CC0. Anyone may then
          download and use them, including to train speech models.
        </P>
        <P>
          The dataset links your recordings with a pseudonymous speaker ID, a one-way hash of your account. It never
          includes your name or email address.
        </P>
      </Section>

      <Section id="model" title="Automatic transcription">
        <P>
          Each recording is sent to a phoneme recognition model that suggests an IPA transcription. Invited speech
          professionals then check and correct it. The model runs only to transcribe; it doesn&apos;t keep your audio.
        </P>
      </Section>

      <Section id="providers" title="Who else handles it">
        <P>These services process data on our behalf:</P>
        <List>
          <li>Cloudflare runs the website and stores the recordings (Workers and R2).</li>
          <li>Neon stores accounts and the database, in Singapore (AWS ap-southeast-1).</li>
          <li>Modal runs the transcription model on its GPUs in the United States.</li>
          <li>Microsoft Azure Communication Services sends verification and password reset emails.</li>
          <li>Zoho Mail hosts our mailboxes, where your replies go.</li>
        </List>
        <P>They may store this data outside the Philippines. We share data with anyone else only if the law requires it.</P>
      </Section>

      <Section id="security" title="How we protect it">
        <P>
          The site is served only over HTTPS. Passwords are hashed and never stored in plain text. Recordings are stored
          under random IDs, and service keys are kept as encrypted secrets, not in the code.
        </P>
      </Section>

      <Section id="rights" title="Your rights">
        <P>Under the Philippine Data Privacy Act of 2012, you can:</P>
        <List>
          <li>ask what data we hold about you</li>
          <li>have it corrected or deleted</li>
          <li>withdraw your consent, so no new recordings of yours are added to future releases</li>
          <li>get a copy of it</li>
        </List>
        <P>
          We remove your recordings from the corpus and from every future release when you ask. Copies that were
          already published under CC0 can&apos;t be recalled from people who downloaded them. Write to <Mail />. If you
          think we&apos;ve mishandled your data, you can also complain to the{" "}
          <A href="https://privacy.gov.ph">National Privacy Commission</A>.
        </P>
      </Section>

      <Section id="children" title="Children">
        <P>You must be 18 or older to contribute recordings or reviews.</P>
      </Section>

      <Section id="changes" title="Changes to this policy">
        <P>
          When we change this policy, we&apos;ll update the date at the top. If a change affects how your recordings are
          used, we&apos;ll tell you by email first.
        </P>
      </Section>

      <Section id="contact" title="Contact">
        <P>
          Questions about your data go to <Mail />. See also the <A href="/terms">Terms of Service</A>.
        </P>
      </Section>
    </LegalPage>
  );
}
