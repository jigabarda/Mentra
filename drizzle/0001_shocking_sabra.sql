CREATE TABLE "interview_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"job_description" text NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"resume_text" text NOT NULL,
	"score" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
