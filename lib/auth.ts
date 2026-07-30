// lib/auth.ts — JWT & cookie management (client-side)
import Cookies from "js-cookie";
import { CONFIG } from "@/constants/config";
import type { User, Role } from "@/types";

/** Decode JWT payload WITHOUT verification (verification is done server-side) */
export function decodeToken(token: string): { user: User; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Re-add base64 padding stripped by GAS base64EncodeWebSafe
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    b64 += "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(b64));
    return payload;
  } catch {
    return null;
  }
}

/** Check if token is expired */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return Date.now() / 1000 > decoded.exp;
}

/** Get token from cookie */
export function getToken(): string | undefined {
  return Cookies.get(CONFIG.TOKEN_COOKIE_NAME);
}

/** Set token cookie */
export function setToken(token: string): void {
  Cookies.set(CONFIG.TOKEN_COOKIE_NAME, token, {
    expires: CONFIG.TOKEN_EXPIRY_DAYS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

/** Remove token */
export function removeToken(): void {
  Cookies.remove(CONFIG.TOKEN_COOKIE_NAME, { path: "/" });
}

/** Get current user from token */
export function getCurrentUser(): User | null {
  const token = getToken();
  if (!token) return null;
  if (isTokenExpired(token)) {
    removeToken();
    return null;
  }
  const decoded = decodeToken(token);
  return decoded?.user ?? null;
}

/** Check if user has required role */
export function hasRole(role: Role | Role[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}
