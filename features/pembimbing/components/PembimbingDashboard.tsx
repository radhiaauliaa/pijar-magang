// features/pembimbing/components/PembimbingDashboard.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, UserCheck, UserX, CheckSquare, Clock } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { CONFIG } from "@/constants/config";
import { getCurrentUser } from "@/lib/auth";

export function PembimbingDashboard() {
  const user = getCurrentUser();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["pembimbing-stats"],
    queryFn: dashboardService.getPembimbingStats,
    refetchInterval: CONFIG.DASHBOARD_POLL_INTERVAL,
  });

  const statCards = [
    { title: "Total Mahasiswa", value: stats?.jumlah_mahasiswa ?? 0, icon: Users, colorClass: "from-blue-500 to-blue-600" },
    { title: "Mahasiswa Aktif", value: stats?.mahasiswa_aktif ?? 0, icon: UserCheck, colorClass: "from-emerald-500 to-emerald-600" },
    { title: "Mahasiswa Selesai", value: stats?.mahasiswa_selesai ?? 0, icon: UserX, colorClass: "from-slate-500 to-slate-600" },
    { title: "Total Jurnal", value: stats?.total_jurnal ?? 0, icon: BookOpen, colorClass: "from-violet-500 to-violet-600" },
    { title: "Jurnal Pending", value: stats?.jurnal_pending ?? 0, icon: CheckSquare, colorClass: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Halo, ${user?.nama ?? ""}!`}
        description="Monitor progress mahasiswa bimbingan Anda"
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Mahasiswa Saya", href: "/pembimbing/mahasiswa", icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          { label: "Lihat Jurnal", href: "/pembimbing/jurnal", icon: BookOpen, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/30" },
          { label: "Data Absensi", href: "/pembimbing/absensi", icon: Clock, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-4 p-5 rounded-xl border hover:shadow-md transition-all hover:-translate-y-0.5`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="font-semibold">{item.label}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
