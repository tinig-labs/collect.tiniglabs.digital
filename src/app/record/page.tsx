import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { RecordSession } from "./record-session";

export const metadata: Metadata = { title: "Record" };

export default async function Page() {
  await requireUser({ consent: true });
  return <RecordSession />;
}
