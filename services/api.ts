// services/api.ts 
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getToken, removeToken } from "@/lib/auth";
import type { ApiResponse } from "@/types";

const api = axios.create({
  baseURL: "/api/proxy",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor — attach JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//Response Interceptor — handle errors globally 
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      "Terjadi kesalahan"
    );
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan";
}
