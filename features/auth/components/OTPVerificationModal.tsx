// features/auth/components/OTPVerificationModal.tsx
"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, ShieldCheck, RefreshCw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OTPVerificationModalProps {
  email: string;
  isOpen: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function OTPVerificationModal({
  email,
  isOpen,
  onSuccess,
  onCancel,
}: OTPVerificationModalProps) {
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [timerVersion, setTimerVersion] = useState(0); // Forces timer restart on resend
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(300);
    setOtpCode("");
    setErrorMessage("");

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timerVersion]);

  if (!isOpen || !mounted) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Submit OTP for verification
  const handleVerify = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const cleanCode = otpCode.trim();
    if (cleanCode.length < 6) {
      setErrorMessage("Masukkan 6 digit kode OTP.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: cleanCode }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message || "Kode OTP salah");
        toast.error(data.message || "Verifikasi OTP Gagal");
        return;
      }

      toast.success("Verifikasi Berhasil! Status akun Anda kini Aktif.");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsResending(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Kode OTP baru telah dikirimkan ke email Anda.");
        setTimerVersion((v) => v + 1);
        setOtpCode("");
      } else {
        toast.error(data.message || "Gagal mengirim ulang OTP");
      }
    } catch {
      toast.error("Gagal mengirim ulang OTP");
    } finally {
      setIsResending(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-card w-full max-w-sm sm:max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-border space-y-5 text-center relative z-[100000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Masukkan Kode OTP
          </h2>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
            Kode verifikasi 6-digit telah dikirimkan ke email: <br />
            <strong className="text-foreground">{email}</strong>
          </p>
        </div>

        {/* Input & Verification Box (Using standalone div to prevent outer form submit) */}
        <div className="space-y-3.5">
          <div className="space-y-2">
            <Input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="• • • • • •"
              autoFocus
              className="text-center font-mono font-bold text-2xl tracking-[10px] h-12 bg-background border-2 border-blue-500/30 focus-visible:ring-blue-500 rounded-xl placeholder:text-muted-foreground/30"
            />

            {/* Timer info */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-muted-foreground">Masa berlaku OTP:</span>
              <span
                className={`font-mono font-bold ${
                  timeLeft > 60 ? "text-blue-600 dark:text-blue-400" : "text-red-500 animate-pulse"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold text-center">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Verification Button (type="button" to prevent bubbling!) */}
          <Button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || otpCode.length < 6}
            className="w-full h-10 bg-[#14355D] hover:bg-[#0F2A4A] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifikasi Kode...
              </>
            ) : (
              <>
                Verifikasi OTP <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>

        {/* Resend OTP Action */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tidak menerima kode?</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={isResending || timeLeft > 240} // Allowed to resend after 1 min (when 4 mins left)
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 h-8 disabled:opacity-50"
          >
            {isResending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            Kirim Ulang OTP
          </Button>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline pt-0.5"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
