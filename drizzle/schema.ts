import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const resume_analysis = pgTable("resume_analysis", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id"),
  resume_text: text("resume_text").notNull(),
  score: integer("score"),
  feedback: text("feedback"),
  created_at: timestamp("created_at").defaultNow(),
});
