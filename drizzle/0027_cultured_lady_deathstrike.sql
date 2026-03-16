ALTER TABLE "changelog" RENAME TO "changelogs";--> statement-breakpoint
ALTER TABLE "changelogs" DROP CONSTRAINT "changelog_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;