import { students, type Student, type InsertStudent } from "@shared/schema";
import { generateOTP } from "./email";

export interface IStorage {
  createStudent(student: InsertStudent): Promise<Student>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  verifyStudent(email: string, code: string): Promise<boolean>;
  updateVerificationCode(email: string, code: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private students: Map<number, Student>;
  private currentId: number;

  constructor() {
    this.students = new Map();
    this.currentId = 1;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentId++;
    const verificationCode = generateOTP();
    const student: Student = { 
      ...insertStudent, 
      id, 
      verified: false,
      verificationCode,
      referralCode: insertStudent.referralCode || null
    };
    this.students.set(id, student);
    return student;
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.email === email
    );
  }

  async verifyStudent(email: string, code: string): Promise<boolean> {
    const student = await this.getStudentByEmail(email);
    if (!student || student.verificationCode !== code) {
      return false;
    }

    student.verified = true;
    student.verificationCode = null;
    return true;
  }

  async updateVerificationCode(email: string, code: string): Promise<void> {
    const student = await this.getStudentByEmail(email);
    if (student) {
      student.verificationCode = code;
    }
  }
}

export const storage = new MemStorage();