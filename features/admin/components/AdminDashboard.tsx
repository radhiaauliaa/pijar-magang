// features/admin/components/AdminDashboard.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Users, ClipboardList, Clock, MapPin, Building2,
  UserCheck, UserX, TrendingUp, BookOpen,
} from "lucide-react";

import { dashboardService } from "@/services/dashboard.service";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONFIG } from "@/constants/config";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

import { getCurrentUser } from "@/lib/auth";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export function AdminDashboard() {
  const user = getCurrentUser();
  const isAdminUlp = user?.role === "admin_ulp";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: dashboardService.getAdminStats,
    refetchInterval: CONFIG.DASHBOARD_POLL_INTERVAL,
  });

  const statCards = isAdminUlp
    ? [
        {
          title: "Total Mahasiswa",
          value: stats?.total_mahasiswa ?? 0,
          icon: Users,
          colorClass: "from-blue-500 to-blue-600",
        },
        {
          title: "Total Pembimbing",
          value: stats?.total_pembimbing ?? 0,
          icon: Building2,
          colorClass: "from-purple-500 to-indigo-600",
        },
        {
          title: "Mahasiswa Aktif",
          value: stats?.mahasiswa_aktif ?? 0,
          icon: UserCheck,
          colorClass: "from-green-500 to-green-600",
        },
        {
          title: "Mahasiswa Selesai",
          value: stats?.mahasiswa_selesai ?? 0,
          icon: UserX,
          colorClass: "from-slate-500 to-slate-600",
        },
      ]
    : [
        {
          title: "Total Mahasiswa",
          value: stats?.total_mahasiswa ?? 0,
          icon: Users,
          colorClass: "from-blue-500 to-blue-600",
        },
        {
          title: "Total Lamaran",
          value: stats?.total_lamaran ?? 0,
          icon: ClipboardList,
          colorClass: "from-violet-500 to-violet-600",
        },
        {
          title: "Lamaran Menunggu",
          value: stats?.lamaran_menunggu ?? 0,
          icon: Clock,
          colorClass: "from-amber-500 to-amber-600",
        },
        {
          title: "Total Unit",
          value: stats?.total_cabang ?? 0,
          icon: MapPin,
          colorClass: "from-red-500 to-rose-600",
        },
        {
          title: "Mahasiswa Aktif",
          value: stats?.mahasiswa_aktif ?? 0,
          icon: UserCheck,
          colorClass: "from-green-500 to-green-600",
        },
        {
          title: "Mahasiswa Selesai",
          value: stats?.mahasiswa_selesai ?? 0,
          icon: UserX,
          colorClass: "from-slate-500 to-slate-600",
        },
      ];


  // Dynamic chart data from Google Sheets API
  const barData = (stats as any)?.tren_mahasiswa_masuk ?? [
    { name: "Feb", mahasiswa: 0 },
    { name: "Mar", mahasiswa: 0 },
    { name: "Apr", mahasiswa: 0 },
    { name: "Mei", mahasiswa: 0 },
    { name: "Jun", mahasiswa: 0 },
    { name: "Jul", mahasiswa: stats?.total_mahasiswa ?? 0 },
  ];

  const pieData = [
    { name: "Aktif", value: stats?.mahasiswa_aktif ?? 0 },
    { name: "Selesai", value: stats?.mahasiswa_selesai ?? 0 },
    { name: "Lainnya", value: Math.max(0, (stats?.total_mahasiswa ?? 0) - (stats?.mahasiswa_aktif ?? 0) - (stats?.mahasiswa_selesai ?? 0)) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        description="Ringkasan data sistem monitoring magang"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={isLoading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Tren Mahasiswa Masuk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="mahasiswa" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-violet-500" />
              Status Mahasiswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Kelola Mahasiswa", href: "/admin/mahasiswa", icon: Users, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
          { label: "Kelola Divisi", href: "/admin/divisi", icon: Building2, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
          { label: "Lihat Absensi", href: "/admin/absensi", icon: Clock, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${item.color} bg-card`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-center leading-tight">{item.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
