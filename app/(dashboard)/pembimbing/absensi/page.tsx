// app/(dashboard)/pembimbing/absensi/page.tsx
import type { Metadata } from "next";
import { AbsensiAdminPage } from "@/features/absensi/components/AbsensiAdminPage";

export const metadata: Metadata = { title: "Data Absensi" };
export default function PembimbingAbsensiPage() { return <AbsensiAdminPage />; }
