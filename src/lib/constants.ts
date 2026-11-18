export const PROMPT_BATCH = 20;
export const REVIEW_BATCH = 10;
/** A recording is final once this many reviewers agree on the same IPA. */
export const REVIEWS_TO_FINALIZE = 2;
export const MAX_RECORDING_MS = 15_000;
export const MIN_RECORDING_MS = 400;
export const TARGET_SAMPLE_RATE = 16_000;
export const MODAL_BATCH = 32;
/** Failed model transcriptions are retried on later cron runs before a clip is rejected. */
export const MODAL_MAX_ATTEMPTS = 3;

// While true: a site-wide "under development" banner. Indexing is set per page (see NOINDEX).
export const UNDER_DEVELOPMENT = true;

export const SITE_URL = "https://collect.tiniglabs.digital";
export const MAIN_SITE_URL = "https://tiniglabs.digital";

// For sign-in, contributor, and admin pages: nothing there is useful in search results.
export const NOINDEX = { index: false, follow: false } as const;

// Closed beta: contributing requires an invite code (redeemed at onboarding). Admins are exempt.
export const CLOSED_BETA = true;

// Contact page topics (key is stored with the message).
export const CONTACT_TOPICS = {
  general: "General inquiry",
  beta: "Beta access",
  reviewer: "Reviewer access (speech professionals)",
  data: "My data or recordings",
  partnership: "Research or partnership",
} as const;

// Cloudflare Turnstile site key (public). The secret is the TURNSTILE_SECRET_KEY Worker secret.
export const TURNSTILE_SITE_KEY = "0x4AAAAAAGFTbJhzvdkMlt9m";
