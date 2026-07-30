// hooks/useGoogleSignIn.ts
"use client";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

export interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

/**
 * Decode a Google ID-token (JWT) without verifying signature.
 * Signature verification happens on the backend if needed.
 */
function decodeIdToken(token: string): GoogleProfile | null {
  try {
    const [, payload] = token.split(".");
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "="
    );
    const decoded = JSON.parse(atob(padded));
    return {
      email: decoded.email ?? "",
      name: decoded.name ?? "",
      picture: decoded.picture,
      googleId: decoded.sub ?? "",
    };
  } catch {
    return null;
  }
}

interface UseGoogleSignInOptions {
  onSuccess: (profile: GoogleProfile) => void;
}

export function useGoogleSignIn({ onSuccess }: UseGoogleSignInOptions) {
  const isConfigured =
    !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== "your-google-client-id-here.apps.googleusercontent.com";

  // useGoogleLogin must always be called (hooks rule)
  const loginHook = useGoogleLogin({
    flow: "implicit",          // Returns access_token directly, no server exchange needed
    onSuccess: (tokenResponse) => {
      // implicit flow returns access_token; fetch userinfo endpoint
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      })
        .then((r) => r.json())
        .then((info) => {
          const profile: GoogleProfile = {
            email: info.email ?? "",
            name: info.name ?? "",
            picture: info.picture,
            googleId: info.sub ?? "",
          };
          onSuccess(profile);
        })
        .catch(() => toast.error("Gagal mengambil data profil Google"));
    },
    onError: (err) => {
      console.error("[Google OAuth]", err);
      if (err.error !== "access_denied") {
        toast.error("Login Google gagal. Silakan coba lagi.");
      }
    },
  });

  return {
    isConfigured,
    triggerLogin: isConfigured
      ? loginHook
      : () => toast.warning("Google Sign-In belum dikonfigurasi. Tambahkan NEXT_PUBLIC_GOOGLE_CLIENT_ID ke .env.local"),
  };
}
