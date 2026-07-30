// app/page.tsx — Landing page
import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/LandingPage";

export const metadata: Metadata = {
  title: "Monitoring Magang — Platform Digital Manajemen Magang",
  description:
    "Daftar magang, catat jurnal harian, absensi digital, dan monitoring progres — semua dalam satu platform terintegrasi.",
};

export default function RootPage() {
  return <LandingPage />;
}
