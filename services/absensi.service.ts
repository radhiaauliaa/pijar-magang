// services/absensi.service.ts
import api from "./api";
import type { ApiResponse, PaginatedResponse, Kehadiran, AbsensiFilter, AjukanIzinRequest } from "@/types";

import { downloadBase64File } from "@/lib/utils";

export const absensiService = {
  async getAll(filter?: AbsensiFilter): Promise<PaginatedResponse<Kehadiran>["data"]> {
    const res = await api.get<PaginatedResponse<Kehadiran>>("", {
      params: { action: "getAbsensi", ...filter },
    });
    return res.data.data ?? { items: [], total: 0, page: filter?.page ?? 1, limit: filter?.limit ?? 10, totalPages: 0 };
  },

  async getMy(filter?: AbsensiFilter): Promise<PaginatedResponse<Kehadiran>["data"]> {
    const res = await api.get<PaginatedResponse<Kehadiran>>("", {
      params: { action: "getMyAbsensi", ...filter },
    });
    return res.data.data ?? { items: [], total: 0, page: filter?.page ?? 1, limit: filter?.limit ?? 10, totalPages: 0 };
  },

  async getTodayStatus(): Promise<Kehadiran | null> {
    const res = await api.get<ApiResponse<Kehadiran | null>>("", {
      params: { action: "getTodayAbsensi" },
    });
    return res.data.data ?? null;
  },

  async checkIn(foto?: string, keterangan?: string): Promise<Kehadiran> {
    const res = await api.post<ApiResponse<Kehadiran>>("", {
      action: "checkIn",
      foto: foto ?? "",
      keterangan: keterangan ?? "",
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async checkOut(foto?: string, keterangan?: string): Promise<Kehadiran> {
    const res = await api.post<ApiResponse<Kehadiran>>("", {
      action: "checkOut",
      foto: foto ?? "",
      keterangan: keterangan ?? "",
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async ajukanIzin(data: AjukanIzinRequest): Promise<Kehadiran> {
    const res = await api.post<ApiResponse<Kehadiran>>("", {
      action: "ajukanIzin",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async generatePDF(mahasiswaId: string): Promise<string> {
    const res = await api.get<ApiResponse<{ url?: string; pdf_base64?: string; filename?: string }>>("", {
      params: { action: "generateAbsensiPDF", mahasiswa_id: mahasiswaId },
    });
    if (!res.data.success) throw new Error(res.data.message);

    if (res.data.data?.pdf_base64) {
      const filename = res.data.data.filename || "Laporan_Absensi.pdf";
      downloadBase64File(res.data.data.pdf_base64, filename, "application/pdf");
      return "";
    }
    return res.data.data?.url || "";
  },
};

