// services/divisi.service.ts
import api from "./api";
import type { ApiResponse, Divisi, CreateDivisiRequest } from "@/types";

export const divisiService = {
  async getAll(filter?: { cabang?: string }): Promise<Divisi[]> {
    const res = await api.get<ApiResponse<Divisi[]>>("", {
      params: { action: "getDivisi", ...filter },
    });
    return res.data.data ?? [];
  },

  async getById(id: string): Promise<Divisi> {
    const res = await api.get<ApiResponse<Divisi>>("", {
      params: { action: "getDivisiById", id },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async create(data: CreateDivisiRequest): Promise<Divisi> {
    const res = await api.post<ApiResponse<Divisi>>("", {
      action: "createDivisi",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async update(id: string, data: Partial<CreateDivisiRequest>): Promise<Divisi> {
    const res = await api.post<ApiResponse<Divisi>>("", {
      action: "updateDivisi",
      id,
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async delete(id: string): Promise<void> {
    const res = await api.post<ApiResponse>("", { action: "deleteDivisi", id });
    if (!res.data.success) throw new Error(res.data.message);
  },

  /** Check capacity and get recommendations */
  async checkCapacity(divisiId: string): Promise<{
    available: boolean;
    remaining: number;
    recommendations: Divisi[];
  }> {
    const res = await api.get<ApiResponse<{ available: boolean; remaining: number; recommendations: Divisi[] }>>("", {
      params: { action: "checkDivisiCapacity", id: divisiId },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },
};
