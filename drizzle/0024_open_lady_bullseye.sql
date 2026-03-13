ALTER TABLE "widget_config" RENAME COLUMN "project_name" TO "widget_name";--> statement-breakpoint
ALTER TABLE "widget_config" ALTER COLUMN "info" SET DEFAULT 'Share your feedback and ideas';--> statement-breakpoint
ALTER TABLE "widget_config" ALTER COLUMN "triggerBtn_text" SET DEFAULT 'Feedback';--> statement-breakpoint
ALTER TABLE "widget_config" ALTER COLUMN "triggerBtn_icon" SET DEFAULT 'message-square';