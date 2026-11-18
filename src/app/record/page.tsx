import type { Metadata } from "next";
import { NOINDEX } from "@/lib/constants";
import { requireUser } from "@/lib/session";
import { RecordSession } from "./record-session";

export const metadata: Metadata = { title: "Record", robots: NOINDEX };

export default async function Page() {
  await requireUser({ consent: true });
  return <RecordSession />;
}
