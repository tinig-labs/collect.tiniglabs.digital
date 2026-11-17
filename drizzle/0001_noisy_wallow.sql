ALTER TABLE "recordings" ADD COLUMN "model_attempts" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "recordings" ADD COLUMN "model_error" text;