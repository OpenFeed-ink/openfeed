CREATE TYPE "public"."role" AS ENUM('ADMIN', 'MEMBER');--> statement-breakpoint
CREATE TABLE "users_projects" (
	"user_id" text NOT NULL,
	"project_id" text NOT NULL,
	"role" "role" NOT NULL,
	CONSTRAINT "users_projects_user_id_project_id_pk" PRIMARY KEY("user_id","project_id")
);
--> statement-breakpoint
ALTER TABLE "project" DROP CONSTRAINT "project_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "users_projects" ADD CONSTRAINT "users_projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_projects" ADD CONSTRAINT "users_projects_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" DROP COLUMN "user_id";