// app/(dashboard)/mahasiswa/absensi/page.tsx
import type { Metadata } from "next";
import { AbsensiMahasiswaPage } from "@/features/absensi/components/AbsensiMahasiswaPage";

export const metadata: Metadata = { title: "Absensi Saya" };
export default function AbsensiPage() { return <AbsensiMahasiswaPage />; }
