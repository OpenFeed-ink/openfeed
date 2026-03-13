ALTER TABLE "widget_config" ALTER COLUMN "triggerBtn_text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "widget_config" ALTER COLUMN "triggerBtn_icon" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "widget_config" DROP COLUMN "showAnnouncement";