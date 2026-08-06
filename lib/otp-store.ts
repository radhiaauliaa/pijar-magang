// lib/otp-store.ts
export interface OTPRecord {
  email: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  isUsed: boolean;
}

// Global server-side singleton map for OTP storage
declare global {
  var __otpMemoryStore: Map<string, OTPRecord> | undefined;
}

const otpMemoryStore = globalThis.__otpMemoryStore || new Map<string, OTPRecord>();
if (!globalThis.__otpMemoryStore) {
  globalThis.__otpMemoryStore = otpMemoryStore;
}

/**
 * Generate a 6-digit random OTP code with 5-minute expiration
 */
export function generateOTP(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  // 6 digit random number
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

  const record: OTPRecord = {
    email: normalizedEmail,
    code,
    createdAt: now,
    expiresAt,
    isUsed: false,
  };

  otpMemoryStore.set(normalizedEmail, record);
  console.log(`[OTP Store] Generated OTP ${code} for ${normalizedEmail} (expires in 5 mins)`);
  return code;
}

/**
 * Create a simple signed/encoded token payload for serverless fallback
 */
export function createOTPToken(email: string, code: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const payload = JSON.stringify({ email: normalizedEmail, code: code.trim(), expiresAt });
  return Buffer.from(payload).toString("base64");
}

/**
 * Verify OTP code using in-memory store with fallback to encoded token payload.
 */
export function verifyOTP(
  email: string,
  code: string,
  backupToken?: string
): { success: boolean; message: string; reason?: "incorrect" | "expired" | "not_found" } {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();

  let record = otpMemoryStore.get(normalizedEmail);

  // Fallback to backup token if serverless memory store lost the record across instances
  if (!record && backupToken) {
    try {
      const decoded = JSON.parse(Buffer.from(backupToken, "base64").toString("utf-8"));
      if (decoded.email === normalizedEmail) {
        record = {
          email: decoded.email,
          code: decoded.code,
          createdAt: decoded.expiresAt - 5 * 60 * 1000,
          expiresAt: decoded.expiresAt,
          isUsed: false,
        };
      }
    } catch {
      // Invalid backup token
    }
  }

  if (!record) {
    console.warn(`[OTP Store] No active OTP found for ${normalizedEmail}. Total active OTP keys:`, Array.from(otpMemoryStore.keys()));
    return {
      success: false,
      message: "Kode OTP tidak ditemukan. Silakan kirim ulang OTP.",
      reason: "not_found",
    };
  }

  if (record.isUsed) {
    return {
      success: false,
      message: "Kode OTP telah digunakan. Silakan minta kode baru.",
      reason: "not_found",
    };
  }

  if (Date.now() > record.expiresAt) {
    otpMemoryStore.delete(normalizedEmail);
    return {
      success: false,
      message: "Kode OTP telah kedaluwarsa. Silakan kirim ulang OTP.",
      reason: "expired",
    };
  }

  if (record.code !== cleanCode) {
    return {
      success: false,
      message: "Kode OTP salah.",
      reason: "incorrect",
    };
  }

  // Mark as used and delete to prevent reuse
  record.isUsed = true;
  otpMemoryStore.delete(normalizedEmail);

  console.log(`[OTP Store] OTP verified successfully for ${normalizedEmail}`);
  return {
    success: true,
    message: "Verifikasi OTP berhasil.",
  };
}

/**
 * Get current OTP details
 */
export function getOTPRecord(email: string): OTPRecord | undefined {
  return otpMemoryStore.get(email.toLowerCase().trim());
}
