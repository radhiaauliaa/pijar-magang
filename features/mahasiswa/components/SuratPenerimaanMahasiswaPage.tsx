// features/mahasiswa/components/SuratPenerimaanMahasiswaPage.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, FileText, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CONFIG } from "@/constants/config";

function getGoogleDriveEmbedUrl(url?: string): string | null {
  if (!url || !url.trim()) return null;
  const raw = url.trim();

  // Match /file/d/FILE_ID/
  const fileDMatch = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/file/d/${fileDMatch[1]}/preview`;
  }

  // Match id=FILE_ID
  const idMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  }

  // Fallback: return raw if already preview, else append preview
  if (raw.includes("/preview")) return raw;
  if (raw.includes("/view")) return raw.replace("/view", "/preview");

  return raw;
}

export function SuratPenerimaanMahasiswaPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["mahasiswa-stats"],
    queryFn: dashboardService.getMahasiswaStats,
    refetchInterval: CONFIG.DASHBOARD_POLL_INTERVAL,
  });

  const rawUrl = stats?.surat_penerimaan_url;
  const embedUrl = getGoogleDriveEmbedUrl(rawUrl);

  const handleDownload = () => {
    if (rawUrl) {
      window.open(rawUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Unduh Action Button (Matching Gambar 4 Layout) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Unduh Surat Persetujuan Magang"
          description="Lihat dan unduh berkas resmi Surat Persetujuan Magang dari PT PLN (Persero) UP3 Padang"
        />

        {rawUrl && (
          <Button
            onClick={handleDownload}
            className="w-full sm:w-auto bg-[#005BAC] hover:bg-[#00488A] text-white font-bold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Unduh</span>
          </Button>
        )}
      </div>

      {/* Main Content Viewer (Matching Gambar 4) */}
      {isLoading ? (
        <Card className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            <Skeleton className="h-[600px] w-full rounded-xl" />
          </CardContent>
        </Card>
      ) : embedUrl ? (
        <Card className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-card">
          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Header info badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2 text-[#005BAC] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Dokumen Resmi PT PLN (Persero) UP3 Padang</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />
                <span>Format Dokumen: PDF</span>
              </div>
            </div>

            {/* Embedded Iframe Document Viewer (Matching Gambar 4) */}
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950/40">
              <iframe
                src={embedUrl}
                className="w-full h-[620px] sm:h-[720px] rounded-xl border-0"
                title="Surat Persetujuan Magang"
                allow="autoplay"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        /* State when document URL is not available yet */
        <Card className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 p-8 text-center">
          <CardContent className="p-0 flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-foreground tracking-tight">
              Surat Persetujuan Belum Tersedia
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Berkas Surat Persetujuan Magang Resmi Anda belum diunggah atau sedang dalam proses penyusunan oleh Admin PT PLN (Persero) UP3 Padang.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
