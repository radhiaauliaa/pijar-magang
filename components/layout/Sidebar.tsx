// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Clock,
  Building2,
  MapPin,
  UserCheck,
  Activity,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_CONFIG: Record<Role, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/lamaran", label: "Lamaran Masuk", icon: ClipboardList },
    { href: "/admin/mahasiswa", label: "Mahasiswa", icon: GraduationCap },
    { href: "/admin/divisi", label: "Divisi", icon: Building2 },
    { href: "/admin/cabang", label: "Unit", icon: MapPin },
    { href: "/admin/pembimbing", label: "Pembimbing", icon: UserCheck },
    { href: "/admin/ulp", label: "Admin ULP", icon: ShieldCheck },
    { href: "/admin/absensi", label: "Absensi", icon: Clock },
    { href: "/admin/log", label: "Log Aktivitas", icon: Activity },
  ],
  admin_ulp: [
    { href: "/admin", label: "Dashboard ULP", icon: LayoutDashboard },
    { href: "/admin/mahasiswa", label: "Mahasiswa ULP", icon: GraduationCap },
    { href: "/admin/divisi", label: "Divisi ULP", icon: Building2 },
    { href: "/admin/pembimbing", label: "Pembimbing ULP", icon: UserCheck },
    { href: "/admin/absensi", label: "Absensi ULP", icon: Clock },
  ],
  pembimbing: [
    { href: "/pembimbing", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pembimbing/mahasiswa", label: "Mahasiswa Saya", icon: Users },
    { href: "/pembimbing/jurnal", label: "Jurnal", icon: BookOpen },
    { href: "/pembimbing/absensi", label: "Absensi", icon: Clock },
  ],
  mahasiswa: [
    { href: "/mahasiswa", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mahasiswa/jurnal", label: "Jurnal Saya", icon: BookOpen },
    { href: "/mahasiswa/absensi", label: "Absensi", icon: Clock },
  ],
};

interface SidebarProps {
  role: Role;
  userName: string;
  collapsed?: boolean;
}

export function Sidebar({ role, userName, collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const navItems = NAV_CONFIG[role] ?? [];

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#091A28] border-r border-[#091A28] text-white transition-all duration-300 shadow-lg select-none",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Header Logo PLN & PIJAR */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-white/10 shrink-0 transition-all duration-300",
          collapsed ? "justify-center px-0" : "px-4"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <img
            src="/logo-pln2.png"
            alt="Logo PLN"
            className={cn(
              "object-contain shrink-0 drop-shadow-sm transition-all duration-300",
              collapsed ? "h-7 w-7 mx-auto" : "h-8 w-auto"
            )}
          />
          {!collapsed && (
            <div className="flex flex-col justify-center overflow-hidden">
              <span className="text-white font-black text-lg tracking-tight leading-none">
                PIJAR
              </span>
              <span className="text-[9px] text-sky-200/80 font-semibold tracking-tight leading-tight truncate mt-0.5">
                PT PLN (Persero) UP3 Padang
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <ScrollArea className="flex-1 py-3">
        <nav className={cn("space-y-1.5", collapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isBaseDashboard = item.href === "/admin" || item.href === "/pembimbing" || item.href === "/mahasiswa";
            const isActive = isBaseDashboard ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center text-xs font-semibold transition-all duration-200 group",
                  collapsed
                    ? "w-10 h-10 mx-auto justify-center rounded-xl"
                    : "gap-3 px-3.5 py-2.5 rounded-xl",
                  isActive
                    ? "bg-[#E0F2FE] text-[#091A28] font-bold shadow-xs"
                    : "text-slate-200 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-[#091A28]" : "text-slate-300 group-hover:text-white"
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#091A28] opacity-70" />}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[1.125rem] text-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
