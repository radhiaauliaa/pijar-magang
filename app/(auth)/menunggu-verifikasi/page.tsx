// app/(auth)/menunggu-verifikasi/page.tsx — Clean White Card Layout Matching Auth Theme
import type { Metadata } from "next";
import Link from "next/link";
import { Home, Mail, Clock, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Menunggu Verifikasi — Monitoring Magang PIJAR",
  description: "Pendaftaranmu sedang diproses. Tunggu konfirmasi email dari admin.",
};

export default function MenungguVerifikasiPage() {
  return (
    <div className="w-full space-y-5">
      {/* Clean White Card matching Login & Register */}
      <div className="bg-card rounded-2xl p-6 sm:p-7 shadow-xl border border-border space-y-6 text-center">
        {/* Animated Clock Icon Badge */}
        <div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/20 shadow-xs">
            <Clock className="w-7 h-7 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Pendaftaran Berhasil!
          </h1>
          <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
            Data pendaftaranmu sudah kami terima. Admin akan memverifikasi dan menyetujui akunmu secepatnya.
          </p>
        </div>

        {/* Informational Steps List */}
        <div className="space-y-2.5 text-left">
          <div className="flex items-start gap-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl p-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-foreground text-xs font-bold">Cek Email Kamu</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Admin akan mengirim konfirmasi ke email yang kamu daftarkan setelah akun disetujui.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl p-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-foreground text-xs font-bold">Login Setelah Disetujui</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Begitu akun kamu aktif, masuk menggunakan email dan password yang sudah kamu daftarkan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 rounded-xl p-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-foreground text-xs font-bold">Mulai Monitoring</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Akses dashboard, catat jurnal harian, dan absensi digitalmu setiap hari.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Step Bar */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1.5 rounded-full bg-blue-600" />
            <div className="flex-1 h-1.5 rounded-full bg-blue-500/30 animate-pulse" />
            <div className="flex-1 h-1.5 rounded-full bg-muted" />
          </div>
          <div className="flex text-[11px] text-muted-foreground justify-between font-semibold">
            <span className="text-blue-600 dark:text-blue-400 font-bold">✓ Daftar</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Verifikasi Admin</span>
            <span>Login &amp; Mulai</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Link href="/login" id="menunggu-login-btn">
            <Button
              className="w-full h-11 text-xs font-bold bg-[#14355D] hover:bg-[#0F2A4A] text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Sudah disetujui? Login sekarang <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>

          <Link href="/" id="menunggu-home-btn">
            <Button
              variant="outline"
              className="w-full h-10 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
