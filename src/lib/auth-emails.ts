import "server-only";

/**
 * Branded copies of the emails Neon Auth would otherwise send with its own template.
 * Email clients ignore most CSS, so this is table layout with inline styles, the tinig labs
 * palette, and system fonts (web fonts don't load in Gmail or Outlook).
 */

const SITE = "https://collect.tiniglabs.digital";
const C = { gatas: "#f9fbfa", tinta: "#13261f", abo: "#5f6f68", pandan: "#1f6b4f", mint: "#e2f3ea", line: "#e3e8e5" };
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

export type OtpType = "email-verification" | "sign-in" | "forget-password";

const COPY: Record<OtpType, { subject: string; heading: string; intro: string; ignore: string }> = {
  "email-verification": {
    subject: "Your verification code",
    heading: "Confirm your email",
    intro: "Enter this code on the sign-up page to finish creating your account.",
    ignore: "If you didn't create an account, you can ignore this email.",
  },
  "sign-in": {
    subject: "Your sign-in code",
    heading: "Sign in",
    intro: "Enter this code to sign in.",
    ignore: "If you didn't try to sign in, you can ignore this email. Your account is safe.",
  },
  "forget-password": {
    subject: "Your password reset code",
    heading: "Reset your password",
    intro: "Enter this code on the reset page, then choose a new password.",
    ignore: "If you didn't ask to reset your password, you can ignore this email. Your password won't change.",
  },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function minutesLeft(expiresAt?: string) {
  const ms = expiresAt ? Date.parse(expiresAt) - Date.now() : NaN;
  return Number.isFinite(ms) && ms > 0 ? Math.max(1, Math.round(ms / 60_000)) : null;
}

export function otpEmail(type: OtpType, code: string, expiresAt?: string) {
  const c = COPY[type] ?? COPY["email-verification"];
  const mins = minutesLeft(expiresAt);
  const expiry = mins ? `The code expires in ${mins} minute${mins === 1 ? "" : "s"}.` : "The code expires soon.";
  const digits = esc(code.replace(/\D/g, "") || code);

  const text = [
    `tinig labs speech corpus`,
    "",
    c.heading,
    "",
    c.intro,
    "",
    `    ${code}`,
    "",
    expiry,
    c.ignore,
    "",
    `Need help? Write to hello@tiniglabs.digital`,
    SITE,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.gatas};color:${C.tinta};font-family:${SANS};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${digits} is your tinig labs code. ${esc(expiry)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.gatas}">
<tr><td align="center" style="padding:40px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">
    <tr><td style="padding:0 8px 24px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle"><img src="${SITE}/email-logo.png" width="32" height="32" alt="" style="display:block;border:0"></td>
        <td style="vertical-align:middle;padding-left:10px;font-family:Montserrat,${SANS};font-size:18px;font-weight:600;letter-spacing:-0.02em;color:${C.tinta}">tinig labs</td>
        <td style="vertical-align:middle;padding-left:8px;font-size:14px;font-weight:500;color:${C.abo}">speech corpus</td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:28px;padding:40px 32px">
      <h1 style="margin:0;font-size:28px;line-height:1.15;font-weight:500;letter-spacing:-0.03em;color:${C.tinta}">${esc(c.heading)}</h1>
      <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:${C.abo}">${esc(c.intro)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0">
        <tr><td align="center" style="background:${C.mint};border-radius:20px;padding:24px 16px">
          <div style="font-family:${MONO};font-size:34px;line-height:1;font-weight:600;letter-spacing:0.18em;color:${C.pandan}">${digits}</div>
        </td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${C.abo}">${esc(expiry)} Don't share it with anyone. We will never ask you for it.</p>
      <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:${C.abo}">${esc(c.ignore)}</p>
    </td></tr>
    <tr><td style="padding:24px 8px 0;font-size:13px;line-height:1.6;color:${C.abo}">
      A public Tagalog speech corpus by tinig labs.<br>
      Questions? <a href="mailto:hello@tiniglabs.digital" style="color:${C.pandan};text-decoration:none;font-weight:600">hello@tiniglabs.digital</a>
      &nbsp;·&nbsp; <a href="${SITE}" style="color:${C.pandan};text-decoration:none;font-weight:600">collect.tiniglabs.digital</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject: `${c.subject}: ${code}`, text, html };
}
