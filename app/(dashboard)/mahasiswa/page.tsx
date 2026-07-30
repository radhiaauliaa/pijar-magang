// app/(dashboard)/mahasiswa/page.tsx
import type { Metadata } from "next";
import { MahasiswaDashboard } from "@/features/mahasiswa/components/MahasiswaDashboard";

export const metadata: Metadata = { title: "Dashboard Mahasiswa" };
export default function MahasiswaDashboardPage() { return <MahasiswaDashboard />; }
