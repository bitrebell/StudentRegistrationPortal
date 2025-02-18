import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter;

export async function initializeEmailTransport() {
  // Create transporter with user's email credentials
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, code: string) {
  if (!transporter) {
    await initializeEmailTransport();
  }

  const mailOptions = {
    from: `"Student Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Email Verification</h1>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 16px; color: #666;">Your verification code is:</p>
          <h2 style="color: #333; text-align: center; font-size: 32px; letter-spacing: 5px;">${code}</h2>
        </div>
        <p style="color: #666;">Enter this code to complete your registration.</p>
        <p style="color: #999; font-size: 12px;">This code will expire in 30 minutes.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return { messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
}