import { auth } from "@/lib/auth/server";
import { verifyTurnstile } from "@/lib/turnstile";

const h = () => auth().handler();
type Ctx = { params: Promise<{ path: string[] }> };

// Sign-ups through this site must pass the Turnstile bot check (token in x-turnstile-token).
async function post(r: Request, c: Ctx) {
  const path = (await c.params).path.join("/");
  if (path === "sign-up/email") {
    const ok = await verifyTurnstile(r.headers.get("x-turnstile-token"), r.headers.get("cf-connecting-ip"));
    if (!ok) {
      return Response.json({ message: "Please complete the bot check and try again.", code: "BOT_CHECK_FAILED" }, { status: 403 });
    }
  }
  return h().POST(r, c);
}

export const GET = (r: Request, c: Ctx) => h().GET(r, c);
export const POST = post;
export const PUT = (r: Request, c: Ctx) => h().PUT(r, c);
export const DELETE = (r: Request, c: Ctx) => h().DELETE(r, c);
export const PATCH = (r: Request, c: Ctx) => h().PATCH(r, c);
