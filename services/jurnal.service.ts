// services/jurnal.service.ts
import api from "./api";
import type { ApiResponse, PaginatedResponse, Jurnal, CreateJurnalRequest, UpdateJurnalRequest, JurnalFilter } from "@/types";
import { fileToBase64, downloadBase64File } from "@/lib/utils";

export const jurnalService = {
  async getAll(filter?: JurnalFilter): Promise<PaginatedResponse<Jurnal>["data"]> {
    const res = await api.get<PaginatedResponse<Jurnal>>("", {
      params: { action: "getJurnal", ...filter },
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

  async getMy(filter?: JurnalFilter): Promise<PaginatedResponse<Jurnal>["data"]> {
    const res = await api.get<PaginatedResponse<Jurnal>>("", {
      params: { action: "getMyJurnal", ...filter },
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

  async getById(id: string): Promise<Jurnal> {
    const res = await api.get<ApiResponse<Jurnal>>("", {
      params: { action: "getJurnalById", id },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async create(data: CreateJurnalRequest): Promise<Jurnal> {
    let fotoBase64: string | undefined;
    let fotoName: string | undefined;
    let fotoType: string | undefined;

    if (data.foto) {
      fotoBase64 = await fileToBase64(data.foto);
      fotoName = data.foto.name;
      fotoType = data.foto.type;
    }

    const res = await api.post<ApiResponse<Jurnal>>("", {
      action: "createJurnal",
      tanggal: data.tanggal,
      judul: data.judul,
      deskripsi: data.deskripsi,
      foto: fotoBase64,
      foto_base64: fotoBase64,
      foto_name: fotoName,
      foto_type: fotoType,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async update(id: string, data: UpdateJurnalRequest): Promise<Jurnal> {
    let fotoBase64: string | undefined;
    let fotoName: string | undefined;
    let fotoType: string | undefined;

    if (data.foto) {
      fotoBase64 = await fileToBase64(data.foto);
      fotoName = data.foto.name;
      fotoType = data.foto.type;
    }

    const res = await api.post<ApiResponse<Jurnal>>("", {
      action: "updateJurnal",
      id,
      ...(data.tanggal && { tanggal: data.tanggal }),
      ...(data.judul && { judul: data.judul }),
      ...(data.deskripsi && { deskripsi: data.deskripsi }),
      ...(fotoBase64 && { foto: fotoBase64, foto_base64: fotoBase64, foto_name: fotoName, foto_type: fotoType }),
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async delete(id: string): Promise<void> {
    const res = await api.post<ApiResponse>("", { action: "deleteJurnal", id });
    if (!res.data.success) throw new Error(res.data.message);
  },

  async verify(id: string, status: "verified"): Promise<void> {
    const res = await api.post<ApiResponse>("", {
      action: "verifyJurnal",
      id,
      status,
    });
    if (!res.data.success) throw new Error(res.data.message);
  },

  async generatePDF(mahasiswaId: string): Promise<string> {
    const res = await api.get<ApiResponse<{ url?: string; pdf_base64?: string; filename?: string }>>("", {
      params: { action: "generateJurnalPDF", mahasiswa_id: mahasiswaId },
    });
    if (!res.data.success) throw new Error(res.data.message);

    if (res.data.data?.pdf_base64) {
      const filename = res.data.data.filename || "Laporan_Jurnal.pdf";
      downloadBase64File(res.data.data.pdf_base64, filename, "application/pdf");
      return "";
    }
    return res.data.data?.url || "";
  },
};
