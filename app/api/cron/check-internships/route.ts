// app/api/cron/check-internships/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import {
  get7DaysReminderTemplate,
  getAccountDeactivatedTemplate,
} from "@/lib/email-templates";
import { addNotification } from "@/lib/notifications-store";

// Cache of already sent 7-day reminders to prevent duplicate daily emails
const sentReminders = new Set<string>();
const deactivatedAccounts = new Set<string>();

export async function GET() {
  return handleCronJob();
}

export async function POST() {
  return handleCronJob();
}

async function handleCronJob() {
  try {
    console.log("[Cron Job] Starting daily internship period check...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Mock/Fetch list of active students
    // In production, this queries the database of active students
    const activeStudents = [
      {
        id: "mhs-1",
        nama: "Radhia Aulia",
        email: "archivepage00@gmail.com",
        tanggal_mulai: "2026-06-01",
        tanggal_selesai: "2026-07-30", // Example 7 days away
        status: "aktif",
      },
    ];

    let reminderCount = 0;
    let deactivationCount = 0;

    for (const student of activeStudents) {
      if (!student.tanggal_selesai || student.status !== "aktif") continue;

      const endDate = new Date(student.tanggal_selesai);
      endDate.setHours(0, 0, 0, 0);

      // Diff in days: (endDate - today)
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      console.log(
        `[Cron Check] Student ${student.nama} (${student.email}) — End: ${student.tanggal_selesai}, Diff: ${diffDays} days`
      );

      // Pengingat 7 Hari Sebelum Selesai
      if (diffDays === 7 && !sentReminders.has(student.email)) {
        console.log(`[Cron Job] Sending 7-day reminder to ${student.email}`);
        const { subject, html } = get7DaysReminderTemplate(student.nama);

        await sendEmail({ to: student.email, subject, html });

        addNotification({
          title: "Periode Magang Akan Berakhir",
          message: "Periode magang Anda akan berakhir dalam 7 hari. Pastikan seluruh jurnal harian dan absensi telah lengkap.",
          type: "reminder",
          user_email: student.email,
        });

        sentReminders.add(student.email);
        reminderCount++;
      }

      // Dinonaktifkan (+7 Hari Setelah Selesai)
      if (diffDays <= -7 && !deactivatedAccounts.has(student.email)) {
        console.log(`[Cron Job] Deactivating account for ${student.email}`);
        const { subject, html } = getAccountDeactivatedTemplate(student.nama);

        await sendEmail({ to: student.email, subject, html });

        addNotification({
          title: "Akun PIJAR Dinonaktifkan",
          message: "Periode magang Anda telah selesai dan akun Anda telah dinonaktifkan secara otomatis.",
          type: "status",
          user_email: student.email,
        });

        deactivatedAccounts.add(student.email);
        deactivationCount++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalChecked: activeStudents.length,
        remindersSent: reminderCount,
        accountsDeactivated: deactivationCount,
      },
    });
  } catch (error) {
    console.error("[Cron Job Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cron job failed",
      },
      { status: 500 }
    );
  }
}
