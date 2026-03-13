CREATE TYPE "public"."theme" AS ENUM('dark', 'light', 'system');--> statement-breakpoint
CREATE TYPE "public"."triggerBtn_position" AS ENUM('float-bottom-right', 'float-bottom-left', 'float-up-right', 'float-up-left', 'drawer-left', 'drawer-right');--> statement-breakpoint
CREATE TYPE "public"."triggerBtn_size" AS ENUM('default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg');--> statement-breakpoint
CREATE TABLE "widget_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"theme" "theme" DEFAULT 'system' NOT NULL,
	"project_name" varchar(50) NOT NULL,
	"info" varchar(255),
	"triggerBtn_position" "triggerBtn_position" DEFAULT 'drawer-right' NOT NULL,
	"triggerBtn_color" varchar(7) DEFAULT '#14b8a6' NOT NULL,
	"triggerBtn_textColor" varchar(7) DEFAULT '#ffffff' NOT NULL,
	"triggerBtn_text" varchar(255) NOT NULL,
	"triggerBtn_icon" varchar(255) NOT NULL,
	"triggerBtn_size" "triggerBtn_size" DEFAULT 'default' NOT NULL,
	"showFeedback" boolean DEFAULT true NOT NULL,
	"showChangeLog" boolean DEFAULT false NOT NULL,
	"showRoadmap" boolean DEFAULT false NOT NULL,
	"showAnnouncement" boolean DEFAULT false NOT NULL,
	CONSTRAINT "widget_config_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "widget_config" ADD CONSTRAINT "widget_config_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_widgetConfig_idx" ON "widget_config" USING btree ("project_id");