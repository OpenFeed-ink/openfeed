ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "author_id" SET NOT NULL;