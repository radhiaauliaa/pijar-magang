// app/(dashboard)/mahasiswa/jurnal/page.tsx
import type { Metadata } from "next";
import { JurnalMahasiswaPage } from "@/features/jurnal/components/JurnalMahasiswaPage";

export const metadata: Metadata = { title: "Jurnal Saya" };
export default function JurnalPage() { return <JurnalMahasiswaPage />; }
