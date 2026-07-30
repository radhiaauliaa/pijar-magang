// app/(dashboard)/admin/mahasiswa/page.tsx
import type { Metadata } from "next";
import { MahasiswaPage } from "@/features/mahasiswa/components/MahasiswaPage";

export const metadata: Metadata = { title: "Kelola Mahasiswa" };

export default function AdminMahasiswaPage() {
  return <MahasiswaPage />;
}
