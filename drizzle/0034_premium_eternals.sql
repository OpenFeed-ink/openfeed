ALTER TABLE "user" ALTER COLUMN "plan" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan" SET DEFAULT 'FREE'::text;--> statement-breakpoint
DROP TYPE "public"."plan";--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('FREE', 'STARTER', 'GROWTH', 'SCALE', 'OS');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan" SET DEFAULT 'FREE'::"public"."plan";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan" SET DATA TYPE "public"."plan" USING "plan"::"public"."plan";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "owner_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "changelogs_project_created_idx" ON "changelogs" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "feature_project_status_created_idx" ON "feature" USING btree ("project_id","status","created_at");--> statement-breakpoint
CREATE INDEX "feature_project_upvotes_idx" ON "feature" USING btree ("project_id","upvotes_count");--> statement-breakpoint
CREATE INDEX "feature_tags_tag_idx" ON "feature_tags" USING btree ("tag_id");--> statement-breakpoint
ALTER TABLE "feature" DROP COLUMN "ai_summary";--> statement-breakpoint
ALTER TABLE "feature" DROP COLUMN "priority_score";