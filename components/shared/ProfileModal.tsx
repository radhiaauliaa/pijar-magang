// components/shared/ProfileModal.tsx
"use client";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Lock, Camera, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getDirectImageUrl } from "@/lib/utils";
import { setToken } from "@/lib/auth";
import { getErrorMessage } from "@/services/api";
import type { User as UserType } from "@/types";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: UserType | null;
  onUserUpdated?: (newUser: UserType) => void;
}

export function ProfileModal({ open, onClose, user, onUserUpdated }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile picture & name state
  const [foto, setFoto] = useState<string>("");
  const [nama, setNama] = useState<string>("");

  // Password state
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  // Show/hide password toggles
  const [showPwLama, setShowPwLama] = useState(false);
  const [showPwBaru, setShowPwBaru] = useState(false);
  const [showKonfirmasiPw, setShowKonfirmasiPw] = useState(false);

  // Sync state when modal opens or user changes
  useEffect(() => {
    if (user) {
      setFoto(user.foto_profil || "");
      setNama(user.nama || "");
    }
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");
    setShowPwLama(false);
    setShowPwBaru(false);
    setShowKonfirmasiPw(false);
  }, [open, user]);

  // Compress image
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (event) => {
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        setFoto(compressedBase64);
      };
    };
    reader.readAsDataURL(file);
  };

  const updateProfileMutation = useMutation({
    mutationFn: () => authService.updateProfile({ nama, foto_profil: foto }),
    onSuccess: (res) => {
      toast.success("Profil berhasil diperbarui!");
      if (foto && user?.id) {
        localStorage.setItem(`pijar_avatar_${user.id}`, foto);
      }
      if (res?.token) {
        setToken(res.token);
      }
      if (res?.user && onUserUpdated) {
        onUserUpdated(res.user);
      }
      onClose();
      window.location.reload();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authService.changePassword({
        password_lama: passwordLama,
        password_baru: passwordBaru,
        konfirmasi_password: konfirmasiPassword,
      }),
    onSuccess: () => {
      toast.success("Password berhasil diubah!");
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!user) return null;

  const subtitle =
    user.role === "mahasiswa"
      ? user.program_studi || user.divisi_nama || "Mahasiswa Magang"
      : user.role === "pembimbing"
      ? user.divisi_nama ? `Pembimbing · ${user.divisi_nama}` : "Pembimbing Magang"
      : "Administrator";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Pengaturan Akun & Profil
          </DialogTitle>
        </DialogHeader>

        {/* Tab switch */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Foto & Nama Profil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "password"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Ubah Password
          </button>
        </div>

        {activeTab === "profile" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfileMutation.mutate();
            }}
            className="space-y-5 py-2"
          >
            {/* Avatar preview & upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-primary/30 shadow-md overflow-hidden">
                  {foto ? (
                    <img
                      src={getDirectImageUrl(foto)}
                      alt={user.nama}
                      className="aspect-square h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <User className="w-10 h-10 text-slate-400" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                </label>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{user.nama}</p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-nama">Nama Lengkap</Label>
              <Input
                id="profile-nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Anda..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user.email} disabled className="bg-muted text-muted-foreground opacity-80" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Profil
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              changePasswordMutation.mutate();
            }}
            className="space-y-4 py-2"
            autoComplete="off"
          >
            {/* Password Saat Ini */}
            <div className="space-y-1.5">
              <Label htmlFor="pwd-lama">Password Saat Ini</Label>
              <Input
                id="pwd-lama"
                type="password"
                placeholder="********"
                value={passwordLama}
                onChange={(e) => setPasswordLama(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Password Baru */}
            <div className="space-y-1.5">
              <Label htmlFor="pwd-baru">Password Baru</Label>
              <div className="relative">
                <Input
                  id="pwd-baru"
                  type={showPwBaru ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwBaru((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwBaru ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="space-y-1.5">
              <Label htmlFor="pwd-konfirmasi">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="pwd-konfirmasi"
                  type={showKonfirmasiPw ? "text" : "password"}
                  placeholder="Ketik ulang password baru"
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKonfirmasiPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showKonfirmasiPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending || !passwordLama || !passwordBaru || !konfirmasiPassword}
              >
                {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Ubah Password
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
