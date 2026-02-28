CREATE TYPE "public"."plan" AS ENUM('FREE', 'BASIC', 'PRO', 'BUSINESS', 'ENTERPRISE', 'OS');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan" SET DEFAULT 'FREE'::"public"."plan";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "plan" SET DATA TYPE "public"."plan" USING "plan"::"public"."plan";