ALTER TABLE "invitation" RENAME COLUMN "created_at" TO "expires_at";--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_email_unique" UNIQUE("email");