import nodemailer from "nodemailer";

// Create a test account using Ethereal for development
async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

let transporter: nodemailer.Transporter;

export async function initializeEmailTransport() {
  transporter = await createTestAccount();
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, code: string) {
  if (!transporter) {
    await initializeEmailTransport();
  }

  const mailOptions = {
    from: '"Student Portal" <noreply@example.com>',
    to: email,
    subject: "Verify your email",
    html: `
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>Enter this code to complete your registration.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Preview URL:", previewUrl);
    return { messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
}