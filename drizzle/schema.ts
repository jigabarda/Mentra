import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 256 }).notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resume_analysis = pgTable("resume_analysis", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id"),
  resume_text: text("resume_text").notNull(),
  score: integer("score"),
  feedback: text("feedback"),
  created_at: timestamp("created_at").defaultNow(),
});

export const interview_sessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  user_email: text("user_email").notNull(),
  job_description: text("job_description").notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  feedback: text("feedback"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
