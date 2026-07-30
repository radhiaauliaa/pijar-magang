// services/auth.service.ts
import api from "./api";
import type {
  ApiResponse,
  AuthPayload,
  LoginRequest,
  DaftarAkunRequest,
  DaftarMagangRequest,
  AktivasiPembimbingRequest,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types";


export const authService = {
  /** Authenticate user, returns token */
  async login(data: LoginRequest): Promise<AuthPayload> {
    const res = await api.post<ApiResponse<AuthPayload>>("", {
      action: "login",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  async daftarAkun(data: DaftarAkunRequest): Promise<void> {
    const res = await api.post<ApiResponse>("", {
      action: "daftarAkun",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
  },

  async daftarMagang(data: DaftarMagangRequest): Promise<void> {
    const res = await api.post<ApiResponse>("", {
      action: "daftarMagang",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
  },

  /** @deprecated Gunakan daftarAkun() +dan daftarMagang() */
  async register(data: DaftarAkunRequest): Promise<void> {
    return this.daftarAkun(data);
  },

  /** Aktivasi akun pembimbing — set password pertama kali */
  async aktivasiPembimbing(data: AktivasiPembimbingRequest): Promise<void> {
    const res = await api.post<ApiResponse>("", {
      action: "aktivasiPembimbing",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
  },

  /** Get current user from Apps Script */
  async me(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("", {
      params: { action: "me" },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  /** Invalidate token */
  async logout(): Promise<void> {
    await api.post<ApiResponse>("", { action: "logout" }).catch(() => {});
  },

  /** Update nama & foto profil user */
  async updateProfile(data: UpdateProfileRequest): Promise<{ user: User; token?: string }> {
    const res = await api.post<ApiResponse<{ user: User; token?: string }>>("", {
      action: "updateProfile",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data!;
  },

  /** Ubah password user */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const res = await api.post<ApiResponse>("", {
      action: "changePassword",
      ...data,
    });
    if (!res.data.success) throw new Error(res.data.message);
  },
};

