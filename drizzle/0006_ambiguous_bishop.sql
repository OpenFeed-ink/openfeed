ALTER TABLE "comments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "feature_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "feature" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "feature" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "upvotes" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "upvotes" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "upvotes" ALTER COLUMN "feature_id" SET DATA TYPE text;