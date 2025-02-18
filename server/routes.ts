import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertStudentSchema } from "@shared/schema";
import { sendVerificationEmail, generateOTP, initializeEmailTransport } from "./email";
import { ZodError } from "zod";

export async function registerRoutes(app: Express) {
  // Initialize email transport
  await initializeEmailTransport();

  app.post("/api/register", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);

      const existingStudent = await storage.getStudentByEmail(studentData.email);
      if (existingStudent) {
        return res.status(400).json({ message: "Email already registered" });
      }

      try {
        const student = await storage.createStudent(studentData);
        await sendVerificationEmail(student.email, student.verificationCode!);
        return res.json({ email: student.email });
      } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Failed to register student. Please try again later." });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0].message });
      }
      console.error("Unexpected error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/verify", async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required" });
      }

      const verified = await storage.verifyStudent(email, code);
      if (!verified) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Failed to verify email. Please try again later." });
    }
  });

  app.post("/api/resend-code", async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Resend code error:", error);
      res.status(500).json({ message: "Failed to resend code. Please try again later." });
    }
  });

  return createServer(app);
}