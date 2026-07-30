// services/cabang.service.ts
import api from "./api";
import type { ApiResponse, Cabang, CreateCabangRequest } from "@/types";

export const cabangService = {
  async getAll(): Promise<Cabang[]> {
    const res = await api.get<ApiResponse<Cabang[]>>("", {
      params: { action: "getCabang" },
    });
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<Cabang> {
    const res = await api.get<ApiResponse<Cabang>>("", {
      params: { action: "getCabangById", id },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async create(data: CreateCabangRequest): Promise<Cabang> {
    const res = await api.post<ApiResponse<Cabang>>("", {
      action: "createCabang",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async update(id: string, data: Partial<CreateCabangRequest>): Promise<Cabang> {
    const res = await api.post<ApiResponse<Cabang>>("", {
      action: "updateCabang",
      id,
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async delete(id: string): Promise<void> {
    const res = await api.post<ApiResponse>("", { action: "deleteCabang", id });
    if (!res.data.success) throw new Error(res.data.message);
  },
};
