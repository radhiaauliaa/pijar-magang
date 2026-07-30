// app/(auth)/login/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk — PIJAR PT PLN (Persero) UP3 Padang",
  description: "Masuk ke Platform Monitoring Magang PIJAR PLN UP3 Padang",
};

export default function LoginPage() {
  return (
    <div className="w-full space-y-5">
      {/* Top Header Text*/}
      <div className="text-center space-y-1.5 py-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Selamat Datang Kembali
        </h1>
        <p className="text-blue-600 dark:text-blue-400 font-bold text-xs">
          PIJAR · PT PLN (Persero) UP3 Padang
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-card rounded-2xl p-6 sm:p-7 shadow-xl border border-border space-y-5">
        <LoginForm />

        <p className="text-center text-muted-foreground text-xs font-medium pt-3 border-t border-border/60">
          Belum punya akun?{" "}
          <Link
            href="/daftar"
            className="text-blue-600 dark:text-blue-400 hover:underline font-bold transition-colors"
          >
            Daftar Magang Baru
          </Link>
        </p>
      </div>
    </div>
  );
}
