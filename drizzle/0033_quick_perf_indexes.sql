CREATE INDEX IF NOT EXISTS "feature_project_status_created_idx" ON "feature" USING btree ("project_id","status","created_at");
CREATE INDEX IF NOT EXISTS "feature_project_upvotes_idx" ON "feature" USING btree ("project_id","upvotes_count");
CREATE INDEX IF NOT EXISTS "feature_tags_tag_idx" ON "feature_tags" USING btree ("tag_id");
CREATE INDEX IF NOT EXISTS "changelogs_project_created_idx" ON "changelogs" USING btree ("project_id","created_at");
