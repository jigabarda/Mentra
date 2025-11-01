CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now()
);
