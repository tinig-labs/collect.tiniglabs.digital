import type { ReactNode } from "react";

export function AuthShell({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 pt-4">
      <div className="space-y-6 rounded-lg bg-card ring-1 ring-inset ring-border p-6 sm:p-8">
        <h1 className="text-3xl font-medium tracking-[-0.03em]">{title}</h1>
        {children}
      </div>
      {footer && <div className="px-2 text-sm text-muted">{footer}</div>}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-danger">
      {message}
    </p>
  );
}

export function safeNext(n: string | null) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : null;
}
