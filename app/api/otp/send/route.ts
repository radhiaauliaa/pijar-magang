// app/api/otp/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateOTP, createOTPToken } from "@/lib/otp-store";
import { sendEmail } from "@/lib/mailer";
import { getOTPEmailTemplate } from "@/lib/email-templates";
import { addNotification } from "@/lib/notifications-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Email tidak valid" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate 6-digit OTP
    const otpCode = generateOTP(normalizedEmail);
    console.log(`[OTP GENERATED] Email: ${normalizedEmail} | Code: ${otpCode}`);

    // Prepare & Send Email from magangplnup3pdg@gmail.com
    const { subject, html } = getOTPEmailTemplate(otpCode);
    const emailResult = await sendEmail({ to: normalizedEmail, subject, html });

    // Add In-App Notification
    addNotification({
      title: "Kode OTP Verifikasi",
      message: `Kode OTP verifikasi akun Anda adalah: ${otpCode}`,
      type: "otp",
      user_email: normalizedEmail,
    });

    const otpToken = createOTPToken(normalizedEmail, otpCode);

    const response = NextResponse.json({
      success: true,
      message: "Kode OTP verifikasi telah dikirimkan ke email Anda.",
      details: emailResult.message,
      otpToken,
    });

    response.cookies.set("mm_otp_token", otpToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[API OTP Send Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim OTP",
      },
      { status: 500 }
    );
  }
}
