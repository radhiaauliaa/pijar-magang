// app/(dashboard)/admin/page.tsx
import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default function AdminPage() {
  return <AdminDashboard />;
}
