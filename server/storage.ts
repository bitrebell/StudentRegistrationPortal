import { students, type Student, type InsertStudent } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { generateOTP } from "./email";

export interface IStorage {
  createStudent(student: InsertStudent): Promise<Student>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  verifyStudent(email: string, code: string): Promise<boolean>;
  updateVerificationCode(email: string, code: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const verificationCode = generateOTP();
    const [student] = await db
      .insert(students)
      .values({
        ...insertStudent,
        verified: false,
        verificationCode,
        referralCode: insertStudent.referralCode || null
      })
      .returning();
    return student;
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.email, email));
    return student;
  }

  async verifyStudent(email: string, code: string): Promise<boolean> {
    const student = await this.getStudentByEmail(email);
    if (!student || student.verificationCode !== code) {
      return false;
    }

    await db
      .update(students)
      .set({
        verified: true,
        verificationCode: null
      })
      .where(eq(students.email, email));

    return true;
  }

  async updateVerificationCode(email: string, code: string): Promise<void> {
    await db
      .update(students)
      .set({ verificationCode: code })
      .where(eq(students.email, email));
  }
}

export const storage = new DatabaseStorage();