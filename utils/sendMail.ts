import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(to: string, otp: string) {
  const filePath = path.join(process.cwd(), "public", "email.html");
  let html = fs.readFileSync(filePath, "utf-8");

  html = html.replace("{{otp}}", otp);

  try {
    await transporter.sendMail({
      from: `noreply<${process.env.SMTP_USER}>`,
      to,
      subject: "Verify your email",
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
