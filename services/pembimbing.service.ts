// services/pembimbing.service.ts
import api from "./api";
import type {
  ApiResponse,
  PaginatedResponse,
  Pembimbing,
  PembimbingFilter,
  CreatePembimbingRequest,
  CreatePembimbingResponse,
  UpdatePembimbingRequest,
} from "@/types";


export const pembimbingService = {
  async getAll(filter?: PembimbingFilter): Promise<PaginatedResponse<Pembimbing>["data"]> {
    const res = await api.get<PaginatedResponse<Pembimbing>>("", {
      params: { action: "getPembimbing", ...filter },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data ?? {
      items: [],
      total: 0,
      page: filter?.page ?? 1,
      limit: filter?.limit ?? 10,
      totalPages: 0,
    };
  },

  async create(data: CreatePembimbingRequest): Promise<CreatePembimbingResponse> {
    const res = await api.post<ApiResponse<CreatePembimbingResponse>>("", {
      action: "createPembimbing",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },


  async update(id: string, data: UpdatePembimbingRequest): Promise<Pembimbing> {
    const res = await api.post<ApiResponse<Pembimbing>>("", {
      action: "updatePembimbing",
      id,
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async delete(id: string): Promise<void> {
    const res = await api.post<ApiResponse>("", {
      action: "deletePembimbing",
      id,
    });
    if (!res.data.success) throw new Error(res.data.message);
  },
};