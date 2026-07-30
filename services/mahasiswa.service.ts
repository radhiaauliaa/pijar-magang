// services/mahasiswa.service.ts
import api from "./api";
import type {
  ApiResponse,
  PaginatedResponse,
  Mahasiswa,
  CreateMahasiswaRequest,
  UpdateMahasiswaRequest,
  MahasiswaFilter,
} from "@/types";
import { toQueryString } from "@/lib/utils";

export const mahasiswaService = {
  /** List all mahasiswa with filters */
  async getAll(filter?: MahasiswaFilter): Promise<PaginatedResponse<Mahasiswa>["data"]> {
    const params = { action: "getMahasiswa", ...filter };
    const res = await api.get<PaginatedResponse<Mahasiswa>>("", { params });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data ?? {
      items: [],
      total: 0,
      page: filter?.page ?? 1,
      limit: filter?.limit ?? 10,
      totalPages: 0,
    };
  },

  /** Get single mahasiswa */
  async getById(id: string): Promise<Mahasiswa> {
    const res = await api.get<ApiResponse<Mahasiswa>>("", {
      params: { action: "getMahasiswaById", id },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  /** Create mahasiswa */
  async create(data: CreateMahasiswaRequest): Promise<Mahasiswa> {
    const res = await api.post<ApiResponse<Mahasiswa>>("", {
      action: "createMahasiswa",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  /** Update mahasiswa */
  async update(id: string, data: UpdateMahasiswaRequest): Promise<Mahasiswa> {
    const res = await api.post<ApiResponse<Mahasiswa>>("", {
      action: "updateMahasiswa",
      id,
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  /** Delete mahasiswa */
  async delete(id: string): Promise<void> {
    const res = await api.post<ApiResponse>("", {
      action: "deleteMahasiswa",
      id,
    });
    if (!res.data.success) throw new Error(res.data.message);
  },

  async getPembimbingList(): Promise<{ id: string; nama: string; divisi: string; cabang: string }[]> {
    const res = await api.get<ApiResponse<{ id: string; nama: string; divisi: string; cabang: string }[]>>("", {
      params: { action: "getPembimbingList" },
    });
    return res.data.data ?? [];
  },

  async importBulk(rows: CreateMahasiswaRequest[]): Promise<{ created: number; errors: string[] }> {
    const res = await api.post<ApiResponse<{ created: number; errors: string[] }>>("", {
      action: "importMahasiswa",
      rows,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async export(filter?: MahasiswaFilter): Promise<string> {
    const res = await api.get<ApiResponse<{ url: string }>>("", {
      params: { action: "exportMahasiswa", ...filter },
    });
    return res.data.data!.url;
  },
};
