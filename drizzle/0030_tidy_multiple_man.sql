ALTER TABLE "widget_config" ADD COLUMN "triggerBtn" jsonb DEFAULT '{"position":"drawer-left","color":"#14b8a6","textColor":"#ffffff","size":"lg","text":"Feedback","icon":"message-square"}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "widget_config" DROP COLUMN "triggerBtn_position";--> statement-breakpoint
ALTER TABLE "widget_config" DROP COLUMN "triggerBtn_color";--> statement-breakpoint
ALTER TABLE "widget_config" DROP COLUMN "triggerBtn_textColor";--> statement-breakpoint
ALTER TABLE "widget_config" DROP COLUMN "triggerBtn_text";--> statement-breakpoint
ALTER TABLE "widget_config" DROP COLUMN "triggerBtn_icon";--> statement-breakpoint
ALTER TABLE "widget_config" DROP COLUMN "triggerBtn_size";