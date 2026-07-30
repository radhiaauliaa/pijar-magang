// app/(auth)/aktivasi/page.tsx — Clean White Card Theme
import type { Metadata } from "next";
import { Users } from "lucide-react";
import { Suspense } from "react";
import { AktivasiForm } from "@/features/auth/components/AktivasiForm";

export const metadata: Metadata = {
  title: "Aktivasi Akun Pembimbing — Monitoring Magang PIJAR",
  description: "Aktifkan akun pembimbing kamu dan buat password untuk mulai memonitor mahasiswa bimbingan.",
};

export default function AktivasiPage() {
  return (
    <div className="w-full space-y-5">
      <div className="bg-card rounded-2xl p-6 sm:p-7 shadow-xl border border-border space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-500/20 shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Aktivasi Pembimbing</h1>
          <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
            Selamat datang! Kamu ditunjuk sebagai pembimbing magang.
          </p>
        </div>

        <div className="bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 rounded-xl p-3.5 flex gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-purple-600/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Admin telah menugaskan kamu sebagai pembimbing. Buat password untuk mengaktifkan akun dan mulai memonitor mahasiswa bimbinganmu.
          </p>
        </div>

        <Suspense fallback={<div className="text-muted-foreground text-center py-4 text-xs">Memuat form...</div>}>
          <AktivasiForm />
        </Suspense>
      </div>
    </div>
  );
}
