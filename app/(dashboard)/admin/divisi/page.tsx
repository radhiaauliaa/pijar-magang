// app/(dashboard)/admin/divisi/page.tsx
import type { Metadata } from "next";
import { DivisiPage } from "@/features/divisi/components/DivisiPage";

export const metadata: Metadata = { title: "Kelola Divisi" };
export default function AdminDivisiPage() { return <DivisiPage />; }
