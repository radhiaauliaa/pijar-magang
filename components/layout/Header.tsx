// components/layout/Header.tsx
"use client";
import { Bell, LogOut, Menu, X, User as UserIcon, Settings, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { getInitials, getDirectImageUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { CONFIG } from "@/constants/config";
import { ProfileModal } from "@/components/shared/ProfileModal";
import type { Notification as AppNotification } from "@/types";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && user?.id) {
      const cached = localStorage.getItem(`pijar_avatar_${user.id}`);
      if (cached) setLocalAvatar(cached);
    }
  }, [user?.id]);

  const activeAvatar = user?.foto_profil || localAvatar;

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.email, user?.role],
    queryFn: async () => {
      let localNotifs: AppNotification[] = [];
      let remoteNotifs: AppNotification[] = [];

      if (user?.email) {
        try {
          const url = `/api/notifications?email=${encodeURIComponent(user.email)}&role=${encodeURIComponent(user.role || "")}`;
          const res = await fetch(url);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            localNotifs = json.data;
          }
        } catch {}
      }

      try {
        remoteNotifs = await dashboardService.getNotifications();
      } catch {}

      const combined = [...localNotifs, ...remoteNotifs];
      const seen = new Set<string>();
      const result: AppNotification[] = [];

      for (const n of combined) {
        const key = n.id || `${n.title}-${n.message}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(n);
        }
      }

      return result;
    },
    refetchInterval: CONFIG.NOTIFICATION_POLL_INTERVAL,
    enabled: !!user,
  });

  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && user?.id) {
      try {
        const stored = localStorage.getItem(`pijar_read_notifs_${user.id}`);
        if (stored) setReadNotifIds(JSON.parse(stored));
      } catch {}
    }
  }, [user?.id]);

  const markAsReadLocal = (id: string) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      if (user?.id) localStorage.setItem(`pijar_read_notifs_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsReadLocal = (allIds: string[]) => {
    setReadNotifIds((prev) => {
      const merged = Array.from(new Set([...prev, ...allIds]));
      if (user?.id) localStorage.setItem(`pijar_read_notifs_${user.id}`, JSON.stringify(merged));
      return merged;
    });
  };

  const unreadCount = notifications.filter(
    (n: AppNotification) => !(n.read || readNotifIds.includes(n.id))
  ).length;

  const handleNotificationClick = (id: string) => {
    markAsReadLocal(id);
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allIds = notifications.map((n: AppNotification) => n.id);
    markAllAsReadLocal(allIds);
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true, email: user?.email }),
    }).catch(() => {});
  };

  const subtitle =
    user?.role === "mahasiswa"
      ? user.program_studi || user.divisi_nama || "Mahasiswa Magang"
      : user?.role === "pembimbing"
      ? user.divisi_nama || "Pembimbing Magang"
      : "Administrator";

  return (
    <>
      <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-3 sticky top-0 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          id="sidebar-toggle-btn"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        <div className="flex-1" />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifikasi"
              id="notification-btn"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden shadow-lg border-border">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
              <span className="font-semibold text-sm text-foreground">Notifikasi</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tandai semua dibaca
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Tidak ada notifikasi baru
                </div>
              ) : (
                notifications.slice(0, 6).map((n: AppNotification) => {
                  const isRead = n.read || readNotifIds.includes(n.id);
                  return (
                    <DropdownMenuItem
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id)}
                      className={`flex-col items-start gap-1 p-3.5 cursor-pointer rounded-none focus:bg-accent/60 transition-colors ${
                        !isRead ? "bg-blue-50/70 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <p
                          className={`text-sm ${
                            !isRead ? "font-bold text-blue-600 dark:text-blue-400" : "font-medium text-foreground"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground/70 pt-0.5">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </DropdownMenuItem>
                  );
                })
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User profile header item */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 h-11 px-2.5 hover:bg-accent rounded-xl transition-all"
              id="user-menu-btn"
            >
              <Avatar className="w-8 h-8 border border-border shadow-sm shrink-0 overflow-hidden">
                {activeAvatar ? (
                  <img
                    src={getDirectImageUrl(activeAvatar)}
                    alt={user?.nama || "User"}
                    className="aspect-square h-full w-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="hidden sm:flex flex-col items-start text-left leading-tight">
                <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">
                  {user?.nama}
                </span>
                <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                  {subtitle}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="font-semibold truncate">{user?.nama}</p>
              <p className="text-xs text-muted-foreground font-normal truncate">{subtitle}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
              <Settings className="w-4 h-4 mr-2 text-primary" />
              Pengaturan Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
              id="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Profile Modal */}
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </>
  );
}

