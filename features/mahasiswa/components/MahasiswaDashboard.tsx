// features/mahasiswa/components/MahasiswaDashboard.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, TrendingUp, Calendar, Building2, Briefcase, UserCheck, FileText } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CONFIG } from "@/constants/config";
import { getCurrentUser } from "@/lib/auth";

export function MahasiswaDashboard() {
  const user = getCurrentUser();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["mahasiswa-stats"],
    queryFn: dashboardService.getMahasiswaStats,
    refetchInterval: CONFIG.DASHBOARD_POLL_INTERVAL,
  });

  return (
    <div className="space-y-6">
      {/* Welcome Header with Subtitle & Info Badges */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Selamat Datang, {user?.nama ?? ""}!
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          Pantau progress magang Anda di sini
        </p>
        
        {/* Unit, Divisi, & Pembimbing Vector Icon Badges (Strictly from Database) */}
        <div className="flex flex-wrap items-center gap-2 pt-1.5">
          {(stats?.cabang || user?.cabang) && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-card border border-border rounded-full text-xs font-medium text-foreground shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{stats?.cabang || user?.cabang}</span>
            </div>
          )}

          {(stats?.divisi || user?.divisi) && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-card border border-border rounded-full text-xs font-medium text-foreground shadow-2xs">
              <Briefcase className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
              <span>{stats?.divisi || user?.divisi}</span>
            </div>
          )}

          {stats?.pembimbing_nama && stats.pembimbing_nama !== "-" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-card border border-border rounded-full text-xs font-medium text-foreground shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Pembimbing: {stats.pembimbing_nama}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress magang */}
      {(() => {
        const rawPct = stats?.progress_magang ?? 0;
        const pct = Math.min(100, Math.max(0, rawPct));
        const isCompleted = pct >= 100;

        return (
          <Card
            className={`rounded-2xl transition-all duration-300 shadow-sm ${
              isCompleted
                ? "bg-emerald-500/10 border-2 border-emerald-500/60 dark:bg-emerald-950/30"
                : "bg-[#FDF8E8] border-2 border-[#D9B244] dark:bg-amber-950/20 dark:border-amber-500/60"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-extrabold text-lg text-foreground tracking-tight">Progress Magang</p>
                  <p className="text-xs text-muted-foreground font-medium">Berapa jauh perjalanan Anda</p>
                </div>
                <span
                  className={`font-black text-3xl sm:text-4xl tracking-tight ${
                    isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                  }`}
                >
                  {pct}%
                </span>
              </div>

              {/* Bar progress & Running person illustration */}
              <div className="relative w-full h-3.5 bg-slate-200/80 dark:bg-slate-800 rounded-full my-3 overflow-visible">
                {/* Bar Fill */}
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? "bg-emerald-500" : "bg-[#D9B244]"
                  }`}
                  style={{ width: `${pct}%` }}
                />

                {/* Orang Lari Illustration (Attached seamlessly to progress bar tip - Gambar 3) */}
                {!isCompleted && pct > 0 && (
                  <div
                    className="absolute top-1/2 transition-all duration-500 pointer-events-none z-10"
                    style={{ left: `${pct}%`, transform: "translate(-70%, -50%)" }}
                  >
                    <img
                      src="/orang_lari.png"
                      alt="Orang Lari"
                      className="h-11 w-auto object-contain drop-shadow-sm max-w-[48px]"
                    />
                  </div>
                )}
              </div>

              <p className="text-xs font-medium text-muted-foreground mt-1.5">
                Sisa {stats?.sisa_hari ?? 0} hari dari total magang
              </p>
            </CardContent>
          </Card>
        );
      })()}

      {/* Official Acceptance Letter PDF Download Banner */}
      {stats?.surat_penerimaan_url && (
        <Card className="bg-blue-50/80 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800/60 rounded-2xl overflow-hidden shadow-xs">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-blue-950 dark:text-blue-200 tracking-tight">
                  Surat Balasan Resmi Penerimaan Magang
                </h3>
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Dokumen persetujuan resmi dari PT PLN (Persero) UP3 Padang
                </p>
              </div>
            </div>
            <a
              href={stats.surat_penerimaan_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>Unduh Surat Penerimaan (PDF)</span>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <StatCard
          title="Total Jurnal"
          value={stats?.total_jurnal ?? 0}
          icon={BookOpen}
          colorClass="from-violet-500 to-violet-600"
          loading={isLoading}
        />
        <StatCard
          title="Hari Hadir"
          value={stats?.total_hadir ?? 0}
          icon={Clock}
          colorClass="from-emerald-500 to-emerald-600"
          loading={isLoading}
        />
        <StatCard
          title="Progress"
          value={`${stats?.progress_magang ?? 0}%`}
          icon={TrendingUp}
          colorClass="from-blue-500 to-blue-600"
          loading={isLoading}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/mahasiswa/jurnal"
          className="group flex items-center gap-4 p-5 rounded-xl border hover:shadow-md transition-all hover:border-violet-300 dark:hover:border-violet-700"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="font-semibold">Isi Jurnal Hari Ini</p>
            <p className="text-sm text-muted-foreground">Catat aktivitas harian Anda</p>
          </div>
        </a>
        <a
          href="/mahasiswa/absensi"
          className="group flex items-center gap-4 p-5 rounded-xl border hover:shadow-md transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold">Absensi</p>
            <p className="text-sm text-muted-foreground">Check-in / Check-out kehadiran</p>
          </div>
        </a>
      </div>
    </div>
  );
}
