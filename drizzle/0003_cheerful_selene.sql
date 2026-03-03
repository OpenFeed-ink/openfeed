CREATE TYPE "public"."feature_statu" AS ENUM('under_review', 'planned', 'in_progress', 'done', 'closed');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature_id" uuid NOT NULL,
	"content" text NOT NULL,
	"author_name" varchar(255),
	"auther_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "feature_statu" DEFAULT 'under_review' NOT NULL,
	"author_name" varchar(255),
	"author_email" varchar(255),
	"ai_summary" text,
	"priority_score" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upvotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature_id" uuid NOT NULL,
	"voter_email" varchar(255),
	"voter_token" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_feature_id_feature_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_auther_id_user_id_fk" FOREIGN KEY ("auther_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature" ADD CONSTRAINT "feature_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_feature_id_feature_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_feature_voter" ON "upvotes" USING btree ("feature_id","voter_token");