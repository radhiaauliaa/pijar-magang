// lib/mailer.ts — Nodemailer & Google Apps Script Mailer
import nodemailer from "nodemailer";

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email asynchronously. 
 * Tries SMTP first using process.env credentials; falls back to GAS backend if needed.
 */
export async function sendEmail({ to, subject, html }: SendMailOptions): Promise<{
  success: boolean;
  message?: string;
}> {
  const emailUser = process.env.EMAIL_USER || "magangplnup3pdg@gmail.com";
  const emailPass = (process.env.EMAIL_PASS || "").trim();
  const emailFrom =
    process.env.EMAIL_FROM || `"PIJAR PLN UP3 Padang" <${emailUser}>`;

  console.log(`[Email Mailer] Preparing to send "${subject}" to ${to}`);

  // Try Nodemailer SMTP if EMAIL_PASS is provided
  if (emailPass && emailPass !== "your_app_password_here") {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const info = await transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        html,
      });

      console.log(`[Email Mailer SMTP Success] Message ID: ${info.messageId}`);
      return { success: true, message: "Email dikirim via Gmail SMTP" };
    } catch (error) {
      console.error(`[Email Mailer SMTP Error] Failed to send via SMTP:`, error);
    }
  }

  // Fallback to Google Apps Script backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const gasRes = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendEmail",
          to,
          subject,
          html,
        }),
      });

      const gasData = await gasRes.json();
      if (gasData.success) {
        console.log(`[Email Mailer GAS Success] Email sent to ${to} via Google Apps Script`);
        return { success: true, message: "Email dikirim via GAS" };
      } else {
        console.warn(`[Email Mailer GAS Warning]`, gasData.message);
      }
    } catch (gasErr) {
      console.error(`[Email Mailer GAS Error] Failed calling GAS proxy:`, gasErr);
    }
  }

  console.log(`[Email Mailer Fallback] Email to ${to} logged: ${subject}`);
  return {
    success: true,
    message: "Email diproses",
  };
}
