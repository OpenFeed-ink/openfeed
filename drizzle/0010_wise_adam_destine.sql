CREATE TABLE "feature_tags" (
	"feature_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "feature_tags_feature_id_tag_id_pk" PRIMARY KEY("feature_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(7) DEFAULT '#14b8a6' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_project_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "feature_tags" ADD CONSTRAINT "feature_tags_feature_id_feature_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_tags" ADD CONSTRAINT "feature_tags_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;