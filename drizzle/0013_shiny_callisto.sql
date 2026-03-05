CREATE INDEX "project_feature_idx" ON "feature" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "user_project_idx" ON "users_projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_user_idx" ON "users_projects" USING btree ("project_id");