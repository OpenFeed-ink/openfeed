ALTER TABLE "comments" ADD COLUMN "reply_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "feature" ADD COLUMN "pinned_comment" uuid;--> statement-breakpoint
ALTER TABLE "feature" ADD CONSTRAINT "feature_pinned_comment_comments_id_fk" FOREIGN KEY ("pinned_comment") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_feature_idx" ON "comments" USING btree ("feature_id");--> statement-breakpoint
CREATE INDEX "comments_parent_idx" ON "comments" USING btree ("parent_id");--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "is_pinned";