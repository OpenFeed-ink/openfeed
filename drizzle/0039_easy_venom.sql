ALTER TABLE "invitation" DROP CONSTRAINT "invitation_email_unique";--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_project_email_unique" UNIQUE("project_id","email");