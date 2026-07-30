// services/dashboard.service.ts
import api from "./api";
import type { ApiResponse, AdminStats, PembimbingStats, MahasiswaStats, Notification } from "@/types";

export const dashboardService = {
  async getAdminStats(): Promise<AdminStats> {
    const res = await api.get<ApiResponse<AdminStats>>("", {
      params: { action: "getAdminStats" },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async getPembimbingStats(): Promise<PembimbingStats> {
    const res = await api.get<ApiResponse<PembimbingStats>>("", {
      params: { action: "getPembimbingStats" },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async getMahasiswaStats(): Promise<MahasiswaStats> {
    const res = await api.get<ApiResponse<MahasiswaStats>>("", {
      params: { action: "getMahasiswaStats" },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async getNotifications(): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>("", {
      params: { action: "getNotifications" },
    });
    return res.data.data ?? [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await api.post("", { action: "markNotificationRead", id });
  },

  async pushNotification(payload: {
    title: string;
    message: string;
    type?: Notification["type"];
    user_email?: string;
    role?: string;
  }): Promise<void> {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", ...payload }),
      });
    } catch {}
  },
};
