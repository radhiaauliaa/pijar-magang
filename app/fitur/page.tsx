// app/fitur/page.tsx — Fitur page
import type { Metadata } from "next";
import { FiturPage } from "@/features/landing/components/FiturPage";

export const metadata: Metadata = {
  title: "Fitur Utama — PIJAR PLN UP3 Padang",
  description:
    "Jelajahi fitur lengkap platform PIJAR: absensi selfie digital, jurnal kegiatan harian, pengajuan izin, laporan PDF resmi, hingga proteksi masa magang.",
};

export default function Page() {
  return <FiturPage />;
}
