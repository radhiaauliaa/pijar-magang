// app/api/email/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import {
  getLamaranSubmittedTemplate,
  getLamaranAcceptedTemplate,
  getLamaranRejectedTemplate,
  get7DaysReminderTemplate,
  getAccountDeactivatedTemplate,
  getAccountCreatedTemplate,
  getUpdatePenempatanTemplate,
} from "@/lib/email-templates";
import { addNotification } from "@/lib/notifications-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      email,
      nama,
      tanggalMulai,
      tanggalSelesai,
      unitName,
      divisiName,
      pembimbingName,
      password,
      roleLabel,
      creatorName,
    } = body;

    if (!email || !type) {
      return NextResponse.json(
        { success: false, message: "Type dan email wajib diisi" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const recipientName = nama || "Pengguna";

    let emailData: { subject: string; html: string } | null = null;
    let notifTitle = "";
    let notifMessage = "";
    let notifType: "lamaran" | "reminder" | "status" | "info" = "info";

    switch (type) {
      case "update_penempatan":
        emailData = getUpdatePenempatanTemplate({
          nama: recipientName,
          unitName,
          divisiName,
          pembimbingName,
        });
        notifTitle = "Update Penempatan Magang";
        notifMessage = `Penempatan divisi (${divisiName || "-"}) dan pembimbing (${pembimbingName || "-"}) Anda pada unit ${unitName || "PLN"} telah diperbarui.`;
        notifType = "info";
        break;

      case "account_created":
        emailData = getAccountCreatedTemplate({
          nama: recipientName,
          email: normalizedEmail,
          password: password || "-",
          roleLabel: roleLabel || "Pengguna",
          creatorName,
          unitName,
        });
        notifTitle = `Akun ${roleLabel || "Pengguna"} Aktif`;
        notifMessage = `Akun ${roleLabel || "Pengguna"} Anda telah dibuat. Gunakan email dan password sementara untuk login.`;
        notifType = "info";
        break;

      case "lamaran_submitted":
        emailData = getLamaranSubmittedTemplate(recipientName);
        notifTitle = "Lamaran Magang Berhasil Dikirim";
        notifMessage = "Lamaran magang Anda telah berhasil dikirim dan sedang menunggu verifikasi admin.";
        notifType = "lamaran";
        break;

      case "lamaran_accepted":
        emailData = getLamaranAcceptedTemplate(
          recipientName,
          tanggalMulai,
          tanggalSelesai,
          unitName,
          divisiName,
          pembimbingName,
          body.suratPenerimaanUrl
        );
        notifTitle = "Selamat! Lamaran Magang Diterima";
        notifMessage = `Lamaran magang Anda telah diterima pada unit ${unitName || "PT PLN (Persero) UP3 Padang"}. Silakan login ke aplikasi PIJAR.`;
        notifType = "lamaran";
        break;

      case "lamaran_rejected":
        emailData = getLamaranRejectedTemplate(recipientName);
        notifTitle = "Informasi Hasil Seleksi Magang";
        notifMessage = "Mohon maaf, lamaran magang Anda di PT PLN (Persero) UP3 Padang belum dapat diterima.";
        notifType = "lamaran";
        break;

      case "reminder_7days":
        emailData = get7DaysReminderTemplate(recipientName);
        notifTitle = "Periode Magang Akan Berakhir";
        notifMessage = "Periode magang Anda akan berakhir dalam 7 hari. Pastikan seluruh jurnal dan absensi telah terisi.";
        notifType = "reminder";
        break;

      case "account_deactivated":
        emailData = getAccountDeactivatedTemplate(recipientName);
        notifTitle = "Akun PIJAR Dinonaktifkan";
        notifMessage = "Periode magang Anda telah selesai dan akun telah dinonaktifkan secara otomatis.";
        notifType = "status";
        break;

      default:
        return NextResponse.json(
          { success: false, message: `Type email '${type}' tidak dikenal` },
          { status: 400 }
        );
    }

    // Send Email
    const result = await sendEmail({
      to: normalizedEmail,
      subject: emailData.subject,
      html: emailData.html,
    });

    // Add In-App Notification
    addNotification({
      title: notifTitle,
      message: notifMessage,
      type: notifType,
      user_email: normalizedEmail,
    });

    return NextResponse.json({
      success: true,
      message: `Email '${type}' dan notifikasi berhasil diproses`,
      details: result.message,
    });
  } catch (error) {
    console.error("[API Email Send Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Gagal memproses email",
      },
      { status: 500 }
    );
  }
}
