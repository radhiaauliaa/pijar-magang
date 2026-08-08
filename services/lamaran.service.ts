// services/lamaran.service.ts
import api from "./api";
import { fileToBase64 } from "@/lib/utils";
import type {
  ApiResponse,
  PaginatedResponse,
  Lamaran,
  LamaranFilter,
  ApproveLamaranRequest,
  RejectLamaranRequest,
} from "@/types";

const EMPTY: PaginatedResponse<Lamaran>["data"] = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

export const lamaranService = {
  async getAll(filter?: LamaranFilter): Promise<PaginatedResponse<Lamaran>["data"]> {
    const res = await api.get<PaginatedResponse<Lamaran>>("", {
      params: { action: "getLamaran", ...filter },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data ?? EMPTY;
  },

  async approve(data: ApproveLamaranRequest): Promise<{ surat_penerimaan_url?: string } | undefined> {
    let suratBase64 = "";
    let suratType = "";

    if (data.surat_penerimaan && typeof data.surat_penerimaan !== "string") {
      suratBase64 = await fileToBase64(data.surat_penerimaan);
      suratType = data.surat_penerimaan.type;
    } else if (typeof data.surat_penerimaan === "string") {
      suratBase64 = data.surat_penerimaan;
    }

    const res = await api.post<ApiResponse<{ surat_penerimaan_url?: string }>>("", {
      action: "approveLamaran",
      id: data.id,
      divisi: data.divisi,
      cabang: data.cabang,
      pembimbing: data.pembimbing,
      surat_penerimaan_base64: suratBase64,
      surat_penerimaan_type: suratType,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data;
  },

  async reject(data: RejectLamaranRequest): Promise<void> {
    const res = await api.post<ApiResponse>("", {
      action: "rejectLamaran",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
  },
};
