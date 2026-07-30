// app/api/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp-store";
import { addNotification } from "@/lib/notifications-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email dan kode OTP wajib diisi" },
        { status: 400 }
      );
    }

    const result = verifyOTP(email, code);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          reason: result.reason,
        },
        { status: 400 }
      );
    }

    // Notification on account verification
    addNotification({
      title: "Akun Berhasil Diverifikasi",
      message: "Selamat! Akun PIJAR Anda telah aktif secara resmi.",
      type: "status",
      user_email: email,
    });

    return NextResponse.json({
      success: true,
      message: "Verifikasi OTP berhasil. Akun Anda kini Aktif!",
    });
  } catch (error) {
    console.error("[API OTP Verify Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Gagal memverifikasi OTP",
      },
      { status: 500 }
    );
  }
}
