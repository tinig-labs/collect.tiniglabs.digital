import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// Controls follow the tinig labs tokens (BRAND.md): pill buttons, pandan primary, mint hovers,
// 8 / 16 / 24 px radii for tags, fields and cards, and a pandan focus ring on everything.
type Variant = "primary" | "secondary" | "ghost" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover active:translate-y-px",
  secondary: "bg-card text-text ring-1 ring-inset ring-[var(--tinta)]/15 hover:bg-surface hover:ring-accent/30",
  ghost: "text-text/75 hover:bg-surface hover:text-text",
  danger: "bg-card text-danger ring-1 ring-inset ring-danger/30 hover:bg-danger-tint",
};
const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-[background-color,box-shadow,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";

export function Button({ variant = "primary", className = "", ...p }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...p} />;
}

export function ButtonLink({ variant = "primary", className = "", ...p }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...p} />;
}

export const field =
  "h-12 w-full rounded-md bg-card px-4 text-base sm:text-[0.9375rem] ring-1 ring-inset ring-[var(--tinta)]/15 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent aria-[invalid=true]:ring-danger";

export function Input({ className = "", ...p }: ComponentProps<"input">) {
  return <input className={`${field} ${className}`} {...p} />;
}

export function Select({ className = "", ...p }: ComponentProps<"select">) {
  return <select className={`${field} ${className}`} {...p} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Card({ className = "", ...p }: ComponentProps<"div">) {
  return <div className={`rounded-lg bg-card p-4 ring-1 ring-inset ring-border sm:p-8 ${className}`} {...p} />;
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-sm bg-card px-1.5 py-0.5 font-sans text-xs text-muted ring-1 ring-border">{children}</kbd>;
}

/** Small pandan label above a heading, as on tiniglabs.digital. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm font-semibold text-accent ${className}`}>{children}</p>;
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}

/** Pill segmented control (same as the tiniglabs.digital waitlist role picker). */
export function Segmented<T extends string | number>({
  value, options, onChange, label,
}: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-1 rounded-full bg-surface p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            o.value === value ? "bg-card text-text ring-1 ring-inset ring-accent/25" : "text-text/70 hover:text-text"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
