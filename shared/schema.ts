import { pgTable, text, serial, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: varchar("phone", { length: 15 }).notNull(),
  institution: text("institution").notNull(),
  referralCode: text("referral_code"),
  needsAccommodation: boolean("needs_accommodation").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  verificationCode: text("verification_code"),
});

export const insertStudentSchema = createInsertSchema(students)
  .omit({ id: true, verified: true, verificationCode: true })
  .extend({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    institution: z.string().min(2).max(200),
    referralCode: z.string().max(50).optional(),
    needsAccommodation: z.boolean()
  });

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
