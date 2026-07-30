// app/(dashboard)/pembimbing/mahasiswa/page.tsx
import type { Metadata } from "next";
import { MahasiswaPage } from "@/features/mahasiswa/components/MahasiswaPage";

export const metadata: Metadata = { title: "Mahasiswa Saya" };
export default function PembimbingMahasiswaPage() { return <MahasiswaPage />; }
