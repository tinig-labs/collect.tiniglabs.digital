"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Wordmark } from "./brand";

const pill = "block whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors";

// Line icons for the phone tab bar. Review uses the schwa, the most common sound reviewers hear.
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICONS: Record<string, ReactNode> = {
  record: (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...stroke}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </svg>
  ),
  review: (
    <span aria-hidden="true" className="ipa block h-[22px] text-[1.45rem] leading-[18px]">
      ə
    </span>
  ),
  guide: (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...stroke}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z" />
    </svg>
  ),
  account: (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...stroke}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5" />
    </svg>
  ),
};

// Client-side session so every public page can stay static and cacheable.
export function SiteHeader() {
  const { data, isPending } = authClient.useSession();
  const path = usePathname();
  const signedIn = !!data?.user;
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);

  const items = [
    { href: "/record", label: "Record", icon: ICONS.record },
    { href: "/review", label: "Review", icon: ICONS.review },
    { href: "/guide", label: "Guide", icon: ICONS.guide },
    signedIn || isPending
      ? { href: "/account", label: "Account", icon: ICONS.account }
      : { href: "/login", label: "Sign in", icon: ICONS.account },
  ];

  return (
    <>
      <header className="w-full">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-5 py-3.5 sm:px-10 sm:py-6">
          <Link href="/" aria-label="tinig labs speech corpus home" className="rounded-sm">
            <Wordmark />
          </Link>
          {/* Wider screens: pills in the header. Phones use the tab bar below. */}
          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            {items.slice(0, 3).map((i) => (
              <Link
                key={i.href}
                href={i.href}
                aria-current={isActive(i.href) ? "page" : undefined}
                className={`${pill} ${isActive(i.href) ? "bg-surface text-text" : "text-text/70 hover:bg-surface hover:text-text"}`}
              >
                {i.label}
              </Link>
            ))}
            {isPending ? (
              <span className="w-24" />
            ) : signedIn ? (
              <Link
                href="/account"
                aria-current={isActive("/account") ? "page" : undefined}
                className={`${pill} ${isActive("/account") ? "bg-surface text-text" : "text-text/70 hover:bg-surface hover:text-text"}`}
              >
                Account
              </Link>
            ) : (
              <Link href="/login" className={`${pill} text-accent hover:bg-surface`}>
                Sign in
              </Link>
            )}
          </nav>
          {!isPending && !signedIn && (
            <Link href="/signup" className={`${pill} -mr-2 text-accent hover:bg-surface sm:hidden`}>
              Create account
            </Link>
          )}
        </div>
      </header>

      {/* Phones: navigation sits in the thumb zone. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
      >
        <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
          {items.map((i) => {
            const active = isActive(i.href);
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors ${
                    active ? "text-accent" : "text-text/55 active:text-text"
                  }`}
                >
                  <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-surface" : ""}`}>
                    {i.icon}
                  </span>
                  {i.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
