import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertStudentSchema } from "@shared/schema";
import { sendVerificationEmail, generateOTP } from "./email";
import { ZodError } from "zod";

export async function registerRoutes(app: Express) {
  app.post("/api/register", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      
      const existingStudent = await storage.getStudentByEmail(studentData.email);
      if (existingStudent) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const student = await storage.createStudent(studentData);
      await sendVerificationEmail(student.email, student.verificationCode!);
      
      res.json({ email: student.email });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.issues[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post("/api/verify", async (req, res) => {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const verified = await storage.verifyStudent(email, code);
    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    res.json({ message: "Email verified successfully" });
  });

  app.post("/api/resend-code", async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const student = await storage.getStudentByEmail(email);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const newCode = generateOTP();
    await storage.updateVerificationCode(email, newCode);
    await sendVerificationEmail(email, newCode);

    res.json({ message: "Verification code resent" });
  });

  return createServer(app);
}
