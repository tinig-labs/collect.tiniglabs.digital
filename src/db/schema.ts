import { sql } from "drizzle-orm";
import {
  boolean, index, integer, pgEnum, pgTable, smallint, text, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";

// Users themselves live in Neon Auth's `neon_auth` schema; we key everything on its user id.

export const roleEnum = pgEnum("role", ["speaker", "reviewer", "admin"]);
export const promptKindEnum = pgEnum("prompt_kind", ["sentence", "word"]);
export const recordingStatusEnum = pgEnum("recording_status", [
  "pending_model", "model_done", "reviewed", "rejected",
]);
export const reviewActionEnum = pgEnum("review_action", ["approve", "correct", "bad_audio", "skip"]);

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  role: roleEnum("role").notNull().default("speaker"),
  profession: text("profession"),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  ageRange: text("age_range"),
  gender: text("gender"),
  region: text("region"),
  firstLanguage: text("first_language"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const prompts = pgTable(
  "prompts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    text: text("text").notNull(),
    kind: promptKindEnum("kind").notNull(),
    source: text("source").notNull(), // tatoeba | common_voice | wiktionary
    sourceId: text("source_id"),
    sourceAuthor: text("source_author"),
    license: text("license").notNull(),
    recordingsCount: integer("recordings_count").notNull().default(0),
    active: boolean("active").notNull().default(true),
  },
  (t) => [
    uniqueIndex("prompts_text_kind_uq").on(sql`lower(${t.text})`, t.kind),
    index("prompts_next_idx").on(t.active, t.kind, t.recordingsCount),
  ],
);

export const recordings = pgTable(
  "recordings",
  {
    id: uuid("id").primaryKey(),
    promptId: integer("prompt_id").notNull().references(() => prompts.id),
    speakerId: text("speaker_id").notNull(),
    r2Key: text("r2_key").notNull(),
    durationMs: integer("duration_ms").notNull(),
    sampleRate: integer("sample_rate").notNull(),
    status: recordingStatusEnum("status").notNull().default("pending_model"),
    modelIpa: text("model_ipa"),
    modelVersion: text("model_version"),
    modelAttempts: smallint("model_attempts").notNull().default(0),
    modelError: text("model_error"),
    finalIpa: text("final_ipa"),
    reviewCount: smallint("review_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("recordings_status_idx").on(t.status, t.createdAt),
    uniqueIndex("recordings_speaker_prompt_uq").on(t.speakerId, t.promptId),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    recordingId: uuid("recording_id").notNull().references(() => recordings.id, { onDelete: "cascade" }),
    reviewerId: text("reviewer_id").notNull(),
    action: reviewActionEnum("action").notNull(),
    ipa: text("ipa"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("reviews_recording_reviewer_uq").on(t.recordingId, t.reviewerId)],
);

export const inviteCodes = pgTable("invite_codes", {
  code: text("code").primaryKey(),
  role: roleEnum("role").notNull().default("reviewer"),
  maxUses: integer("max_uses").notNull().default(1),
  uses: integer("uses").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  note: text("note"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Role = (typeof roleEnum.enumValues)[number];

// Messages from the contact page. Read and answered from /admin.
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    topic: text("topic").notNull(),
    message: text("message").notNull(),
    userId: text("user_id"),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contact_messages_open_idx").on(t.handledAt, t.createdAt)],
);
