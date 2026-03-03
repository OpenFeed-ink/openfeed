ALTER TABLE "comments" RENAME COLUMN "auther_id" TO "author_id";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_auther_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;