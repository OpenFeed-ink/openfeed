CREATE TYPE "public"."changelog_category" AS ENUM('new_feature', 'improvement', 'bug_fix');--> statement-breakpoint
CREATE TABLE "changelog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" "changelog_category" DEFAULT 'new_feature' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "changelog" ADD CONSTRAINT "changelog_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;