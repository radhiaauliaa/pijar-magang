// app/(dashboard)/admin/log/page.tsx
import type { Metadata } from "next";
import { LogPage } from "@/features/log/components/LogPage";

export const metadata: Metadata = { title: "Log Aktivitas" };
export default function AdminLogPage() { return <LogPage />; }
