// app/(dashboard)/admin/jurnal/page.tsx
import type { Metadata } from "next";
import { JurnalAdminPage } from "@/features/jurnal/components/JurnalAdminPage";

export const metadata: Metadata = { title: "Jurnal Mahasiswa" };
export default function AdminJurnalPage() { return <JurnalAdminPage />; }
