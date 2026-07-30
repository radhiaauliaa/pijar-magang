// hooks/useAuth.ts — Auth state management
"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { getToken, setToken, removeToken, getCurrentUser } from "@/lib/auth";
import { ROLE_DEFAULT_ROUTE } from "@/constants/routes";
import type { LoginRequest } from "@/types";

function getMahasiswaRedirect(mahasiswaStatus?: string): string {
  switch (mahasiswaStatus) {
    case "belum_daftar":
      return "/daftar/magang";
    case "menunggu":
      return "/menunggu-verifikasi";
    case "ditolak":
      return "/pendaftaran-ditolak";
    case "aktif":
    default:
      return ROLE_DEFAULT_ROUTE["mahasiswa"];
  }
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const payload = await authService.login(data);
      setToken(payload.token);
      return payload;
    },
    onSuccess: (payload) => {
      toast.success(`Selamat datang, ${payload.user.nama}!`);

      let redirect: string;
      if (payload.user.role === "mahasiswa") {
        redirect = getMahasiswaRedirect(payload.user.mahasiswa_status);
      } else {
        redirect = ROLE_DEFAULT_ROUTE[payload.user.role] ?? "/login";
      }

      window.location.href = redirect;
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Login gagal";
      console.error("[Login Error]", err);
      toast.error(msg);
    },
  });

  const logout = useCallback(async () => {
    await authService.logout();
    removeToken();
    queryClient.clear();
    router.push("/login");
    toast.info("Anda telah keluar");
  }, [router, queryClient]);

  return {
    user,
    isAuthenticated: !!getToken(),
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}
