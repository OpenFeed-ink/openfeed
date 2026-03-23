ALTER TABLE "project" ADD COLUMN "tokens_used" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "tokens_used";