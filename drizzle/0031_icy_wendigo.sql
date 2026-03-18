CREATE TABLE "widget_daily_stats" (
	"project_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"opens" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "widget_daily_stats_project_id_date_pk" PRIMARY KEY("project_id","date")
);
