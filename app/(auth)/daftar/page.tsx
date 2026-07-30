// app/(auth)/daftar/page.tsx
import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun — PIJAR PLN UP3 Padang",
  description: "Buat akun mahasiswa magang di PT PLN (Persero) UP3 Padang.",
};

export default function DaftarPage() {
  return <RegisterForm />;
}
