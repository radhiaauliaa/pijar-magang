// app/(dashboard)/layout.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import type { Role, User } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Read cookie only on client after mount
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    setUser(currentUser);
    setChecked(true);

    // Close sidebar on mobile
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  if (!checked || !user) return <FullPageLoader />;

  // Poin 3: Blokir akses mahasiswa yang sudah selesai magang / ditolak
  if (
    user.role === "mahasiswa" &&
    (user.mahasiswa_status === "selesai" || user.mahasiswa_status === "ditolak")
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
            <span className="text-3xl">🎓</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Masa Magang Telah Berakhir</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Halo <strong className="text-foreground">{user.nama}</strong>, status magang kamu saat ini adalah{" "}
            <span className="font-semibold text-amber-400 capitalize">{user.mahasiswa_status}</span>.
            Akses ke sistem monitoring magang telah ditutup. Terima kasih atas partisipasi dan kontribusi kamu!
          </p>
          <div className="pt-4 border-t border-border">
            <button
              onClick={() => {
                document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                router.replace("/login");
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all text-sm"
            >
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "shrink-0 transition-all duration-300 overflow-hidden",
          sidebarOpen ? "w-56" : "w-16"
        )}
      >
        <Sidebar
          role={user.role as Role}
          userName={user.nama}
          collapsed={!sidebarOpen}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

