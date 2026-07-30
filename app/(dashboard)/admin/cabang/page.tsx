// app/(dashboard)/admin/cabang/page.tsx
import type { Metadata } from "next";
import { CabangPage } from "@/features/cabang/components/CabangPage";

export const metadata: Metadata = { title: "Kelola Unit" };
export default function AdminCabangPage() { return <CabangPage />; }
