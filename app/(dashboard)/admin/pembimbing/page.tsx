import type { Metadata } from "next";
import { PembimbingPage } from "@/features/pembimbing/components/PembimbingPage";

export const metadata: Metadata = { title: "Kelola Pembimbing" };

export default function AdminPembimbingPage() {
  return <PembimbingPage />;
}
