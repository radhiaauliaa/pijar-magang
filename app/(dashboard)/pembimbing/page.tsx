// app/(dashboard)/pembimbing/page.tsx
import type { Metadata } from "next";
import { PembimbingDashboard } from "@/features/pembimbing/components/PembimbingDashboard";

export const metadata: Metadata = { title: "Dashboard Pembimbing" };
export default function PembimbingPage() { return <PembimbingDashboard />; }
