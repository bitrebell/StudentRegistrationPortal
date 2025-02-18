import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "user@ethereal.email",
    pass: "pass",
  },
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(email: string, code: string) {
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

  await transporter.sendMail(mailOptions);
}
