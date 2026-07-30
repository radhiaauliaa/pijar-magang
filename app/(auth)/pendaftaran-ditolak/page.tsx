// app/(auth)/pendaftaran-ditolak/page.tsx — Clean White Card Theme
import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, Mail, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pendaftaran Ditolak — Monitoring Magang PIJAR",
};

export default function PendaftaranDitolakPage() {
  return (
    <div className="w-full space-y-5">
      <div className="bg-card rounded-2xl p-6 sm:p-7 shadow-xl border border-border space-y-6 text-center">
        <div>
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3 border border-red-500/20 shadow-xs">
            <XCircle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Pendaftaran Ditolak</h1>
          <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
            Maaf, lamaran magangmu belum dapat kami terima saat ini. Kamu bisa mencoba mendaftar kembali atau menghubungi admin untuk informasi lebih lanjut.
          </p>
        </div>

        <div className="bg-red-50/70 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 rounded-xl p-3.5 text-left space-y-2">
          <p className="text-red-700 dark:text-red-300 text-[11px] font-bold uppercase tracking-wider">Langkah Selanjutnya</p>
          <ul className="text-muted-foreground text-xs space-y-2">
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>Cek email Anda untuk detail alasan penolakan dari admin.</span>
            </li>
            <li className="flex items-start gap-2">
              <RefreshCcw className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>Perbaiki dokumen yang diperlukan dan ajukan pendaftaran kembali.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link href="/daftar/magang" id="ditolak-daftar-ulang-btn">
            <Button className="w-full h-11 text-xs font-bold bg-[#14355D] hover:bg-[#0F2A4A] text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
              <RefreshCcw className="w-3.5 h-3.5" />
              Daftar Ulang
            </Button>
          </Link>
          <Link href="/" id="ditolak-home-btn">
            <Button variant="outline" className="w-full h-10 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center justify-center gap-2">
              <Home className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
