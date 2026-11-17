CREATE TYPE "public"."prompt_kind" AS ENUM('sentence', 'word');--> statement-breakpoint
CREATE TYPE "public"."recording_status" AS ENUM('pending_model', 'model_done', 'reviewed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."review_action" AS ENUM('approve', 'correct', 'bad_audio', 'skip');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('speaker', 'reviewer', 'admin');--> statement-breakpoint
CREATE TABLE "invite_codes" (
	"code" text PRIMARY KEY NOT NULL,
	"role" "role" DEFAULT 'reviewer' NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"uses" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" "role" DEFAULT 'speaker' NOT NULL,
	"profession" text,
	"consent_at" timestamp with time zone,
	"age_range" text,
	"gender" text,
	"region" text,
	"first_language" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prompts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"text" text NOT NULL,
	"kind" "prompt_kind" NOT NULL,
	"source" text NOT NULL,
	"source_id" text,
	"source_author" text,
	"license" text NOT NULL,
	"recordings_count" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recordings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"prompt_id" integer NOT NULL,
	"speaker_id" text NOT NULL,
	"r2_key" text NOT NULL,
	"duration_ms" integer NOT NULL,
	"sample_rate" integer NOT NULL,
	"status" "recording_status" DEFAULT 'pending_model' NOT NULL,
	"model_ipa" text,
	"model_version" text,
	"final_ipa" text,
	"review_count" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"recording_id" uuid NOT NULL,
	"reviewer_id" text NOT NULL,
	"action" "review_action" NOT NULL,
	"ipa" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_recording_id_recordings_id_fk" FOREIGN KEY ("recording_id") REFERENCES "public"."recordings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "prompts_text_kind_uq" ON "prompts" USING btree (lower("text"),"kind");--> statement-breakpoint
CREATE INDEX "prompts_next_idx" ON "prompts" USING btree ("active","kind","recordings_count");--> statement-breakpoint
CREATE INDEX "recordings_status_idx" ON "recordings" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "recordings_speaker_prompt_uq" ON "recordings" USING btree ("speaker_id","prompt_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_recording_reviewer_uq" ON "reviews" USING btree ("recording_id","reviewer_id");