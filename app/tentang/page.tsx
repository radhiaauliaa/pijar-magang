// app/tentang/page.tsx — Tentang page
import type { Metadata } from "next";
import { TentangPage } from "@/features/landing/components/TentangPage";

export const metadata: Metadata = {
  title: "Tentang Kami — PT PLN (Persero) UP3 Padang",
  description:
    "Profil, Visi & Misi, serta peta interaktif wilayah kerja 10 ULP PT PLN (Persero) UP3 Padang.",
};

export default function Page() {
  return <TentangPage />;
}
