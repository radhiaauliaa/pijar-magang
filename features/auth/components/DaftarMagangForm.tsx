// features/auth/components/DaftarMagangForm.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2, Upload, FileText, X, CheckCircle2,
  AlertCircle, ArrowRight, Search,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchUniversitas } from "@/lib/universities";
import Link from "next/link";

const magangSchema = z
  .object({
    nama: z.string().min(3, "Nama minimal 3 karakter"),
    nim: z.string().min(5, "NIM minimal 5 karakter"),
    universitas: z.string().min(3, "Pilih atau ketik nama institusi"),
    program_studi: z.string().min(2, "Program studi tidak valid"),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
    tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  })
  .refine((d) => new Date(d.tanggal_selesai) > new Date(d.tanggal_mulai), {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["tanggal_selesai"],
  })
  .refine((d) => {
    if (!d.tanggal_selesai) return true;
    const end = new Date(d.tanggal_selesai);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end >= today;
  }, {
    message: "Periode magang telah berakhir. Pendaftaran hanya untuk program magang yang sedang atau akan berlangsung.",
    path: ["tanggal_selesai"],
  })
  .refine((d) => {
    if (!d.tanggal_mulai || !d.tanggal_selesai) return true;
    const start = new Date(d.tanggal_mulai);
    const end = new Date(d.tanggal_selesai);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 45; // Minimal 45 hari
  }, {
    message: "Durasi periode magang minimal adalah 45 hari",
    path: ["tanggal_selesai"],
  });

type MagangFormValues = z.infer<typeof magangSchema>;

async function fetchUniversitasAPI(keyword: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/universitas?keyword=${encodeURIComponent(keyword)}`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

function UniversitasCombobox({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doSearch = (v: string) => {
    if (v.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const apiResults = await fetchUniversitasAPI(v);
      if (apiResults.length > 0) {
        setResults(apiResults);
        setOpen(true);
      } else {
        const local = searchUniversitas(v, 10);
        setResults(local);
        setOpen(local.length > 0);
      }
      setLoading(false);
    }, 300);
  };

  const handleInput = (v: string) => {
    setQuery(v);
    onChange(v);
    doSearch(v);
  };

  const handleSelect = (u: string) => {
    setQuery(u);
    onChange(u);
    setResults([]);
    setOpen(false);
  };

  const inp =
    "bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500 h-11";

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          id="universitas"
          type="text"
          value={query}
          placeholder="Ketik nama kampus..."
          autoComplete="off"
          onFocus={() => {
            if (query.length >= 2) doSearch(query);
          }}
          onChange={(e) => handleInput(e.target.value)}
          className={`${inp} w-full pl-9 pr-9 rounded-md border text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${error ? "border-red-500" : ""
            }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => { setQuery(""); onChange(""); setResults([]); setOpen(false); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {(open || loading) && query.length >= 2 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
          {loading && results.length === 0 ? (
            <li className="px-4 py-3 flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Mencari kampus...
            </li>
          ) : results.length > 0 ? (
            <>
              {results.map((u) => (
                <li key={u}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(u);
                    }}
                  >
                    {u}
                  </button>
                </li>
              ))}
              <li className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
                Tidak ada yang cocok? Ketik nama lengkap institusimu
              </li>
            </>
          ) : (
            <li className="px-4 py-3 text-muted-foreground text-sm text-center">
              Tidak ditemukan — ketik nama lengkap kampusmu
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// File Upload
const ACCEPTED = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
const MAX_MB = 5;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface UploadedFile { file: File; }

function FileUploadBox({
  id, label, required, hint, value, onChange, onRemove, error,
}: {
  id: string; label: string; required?: boolean; hint?: string;
  value: UploadedFile | null;
  onChange: (f: UploadedFile) => void;
  onRemove: () => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File terlalu besar. Maksimal ${MAX_MB}MB.`);
      return;
    }
    onChange({ file });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-foreground text-xs sm:text-sm font-semibold">{label}</Label>
        {required
          ? <span className="text-red-500 text-xs font-semibold">*wajib</span>
          : <span className="text-muted-foreground text-xs">(opsional)</span>
        }
      </div>

      {value ? (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-xs sm:text-sm font-semibold truncate">{value.file.name}</p>
            <p className="text-muted-foreground text-[11px]">{(value.file.size / 1024).toFixed(0)} KB</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          id={id}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`w-full border-2 border-dashed rounded-xl px-4 py-4 text-center transition-all duration-200 ${dragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : error
              ? "border-red-500 bg-red-50 dark:bg-red-950/30"
              : "border-border hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 bg-muted/40"
            }`}
        >
          <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-foreground text-xs font-semibold">
            {hint ? hint : "Klik atau drag & drop file ke sini"}
          </p>
          <p className="text-muted-foreground text-[10px] mt-0.5">
            PDF, Word, JPG, PNG (Maks. {MAX_MB}MB)
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="text-red-500 text-xs font-medium mt-0.5">{error}</p>}
    </div>
  );
}

function FF({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-foreground text-xs font-semibold">{label}</Label>
      {children}
      {error && <p className="text-red-500 text-[10px] font-medium">{error}</p>}
    </div>
  );
}

// Main Component
export function DaftarMagangForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suratAjuan, setSuratAjuan] = useState<UploadedFile | null>(null);
  const [cv, setCv] = useState<UploadedFile | null>(null);
  const [proposal, setProposal] = useState<UploadedFile | null>(null);
  const [fileErrors, setFileErrors] = useState<{ surat?: string; cv?: string; proposal?: string }>({});
  const [universitasValue, setUniversitasValue] = useState("");
  const [user, setUser] = useState<{ nama: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<MagangFormValues>({ resolver: zodResolver(magangSchema) });

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser({ nama: u.nama, email: u.email });
      setValue("nama", u.nama);
    }
    setAuthChecked(true);
  }, [setValue]);

  const onSubmit = async (data: MagangFormValues) => {
    const errs: { surat?: string; cv?: string; proposal?: string } = {};
    if (!suratAjuan) errs.surat = "Surat ajuan dari kampus wajib dilampirkan";
    if (!cv) errs.cv = "CV / Resume wajib dilampirkan";
    if (!proposal) errs.proposal = "Proposal magang wajib dilampirkan";

    if (!suratAjuan || !cv || !proposal) {
      setFileErrors(errs);
      toast.error("Harap lengkapi seluruh dokumen wajib (Surat Ajuan, CV, & Proposal)");
      return;
    }
    setFileErrors({});

    const totalBytes = suratAjuan.file.size + cv.file.size + proposal.file.size;
    const totalMB = totalBytes / (1024 * 1024);
    if (totalMB > 4.2) {
      toast.error(`Total ukuran file (${totalMB.toFixed(1)} MB) melebihi batas sistem 4.2 MB. Harap perkecil/kompres file PDF/gambar Anda sebelum mengunggah.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const suratB64 = await fileToBase64(suratAjuan.file);
      const cvB64 = await fileToBase64(cv.file);
      const proposalB64 = await fileToBase64(proposal.file);

      await authService.daftarMagang({
        nim: data.nim,
        universitas: data.universitas,
        program_studi: data.program_studi,
        tanggal_mulai: data.tanggal_mulai,
        tanggal_selesai: data.tanggal_selesai,
        surat_ajuan: suratB64,
        cv: cvB64,
        proposal: proposalB64,
      });

      if (user?.email) {
        fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "lamaran_submitted",
            email: user.email,
            nama: user.nama,
          }),
        }).catch((e) => console.error("Failed to send submission email", e));
      }

      router.push("/menunggu-verifikasi");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      if (msg.includes("NIM")) {
        setError("nim", { type: "manual", message: msg });
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = "bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500 h-10 text-xs";

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-6 space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <div>
          <p className="text-foreground font-bold">Kamu belum login</p>
          <p className="text-muted-foreground text-sm mt-1">
            Buat akun terlebih dahulu atau login jika sudah punya akun, lalu kembali ke halaman ini.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            Login dulu
          </Link>
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-accent text-foreground border border-border rounded-xl text-sm font-semibold transition-all"
          >
            Buat Akun
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-foreground font-bold text-lg">Data Pendaftaran Magang</h2>
        <p className="text-muted-foreground text-xs mt-0.5">Langkah 2 dari 2 — Isi data &amp; upload dokumen</p>
      </div>

      <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-blue-700 dark:text-blue-300 text-xs font-semibold">Data akun tersimpan</p>
          <p className="text-muted-foreground text-xs truncate">{user.nama} · {user.email}</p>
        </div>
        <Link href="/login" className="text-muted-foreground hover:text-foreground text-xs ml-auto flex-shrink-0 transition-colors font-medium">
          Ubah
        </Link>
      </div>

      {/* Data Mahasiswa */}
      <div>
        <h3 className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Data Mahasiswa</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <FF label="Nama Lengkap" id="nama" error={errors.nama?.message}>
              <Input id="nama" placeholder="Sesuai KTP / KTM" className={inp} {...register("nama")} />
            </FF>
          </div>

          <FF label="NIM" id="nim" error={errors.nim?.message}>
            <Input id="nim" placeholder="12345678" className={inp} {...register("nim")} />
          </FF>

          <FF label="Program Studi" id="program_studi" error={errors.program_studi?.message}>
            <Input id="program_studi" placeholder="Teknik Informatika" className={inp} {...register("program_studi")} />
          </FF>

          <div className="sm:col-span-2">
            <FF label="Universitas / Politeknik / Sekolah Tinggi" id="universitas" error={errors.universitas?.message}>
              <UniversitasCombobox
                value={universitasValue}
                onChange={(v) => {
                  setUniversitasValue(v);
                  setValue("universitas", v, { shouldValidate: true });
                }}
                error={errors.universitas?.message}
              />
            </FF>
          </div>
        </div>
      </div>

      {/* Periode Magang */}
      <div>
        <h3 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Periode Magang</h3>
        <p className="text-muted-foreground text-xs mb-3">Divisi &amp; Unit ditentukan oleh admin. Minimal durasi magang 2 bulan.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FF label="Tanggal Mulai" id="tanggal_mulai" error={errors.tanggal_mulai?.message}>
            <Input id="tanggal_mulai" type="date" className={inp} {...register("tanggal_mulai")} />
          </FF>
          <FF label="Tanggal Selesai" id="tanggal_selesai" error={errors.tanggal_selesai?.message}>
            <Input id="tanggal_selesai" type="date" className={inp} {...register("tanggal_selesai")} />
          </FF>
        </div>
      </div>

      {/* Upload Dokumen */}
      <div>
        <h3 className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Dokumen Pendukung</h3>
        <p className="text-muted-foreground text-xs mb-3">Format: PDF, Word, JPG, atau PNG. Maks. {MAX_MB}MB per file.</p>
        <div className="space-y-3.5">
          <FileUploadBox
            id="upload-surat" label="Surat Ajuan / Pengantar dari Kampus" required
            hint="Surat resmi pengajuan magang dari kampus (PDF)"
            value={suratAjuan} onChange={setSuratAjuan} onRemove={() => setSuratAjuan(null)}
            error={fileErrors.surat}
          />
          <FileUploadBox
            id="upload-cv" label="CV / Resume" required
            hint="Curriculum Vitae terbaru (PDF/Word)"
            value={cv} onChange={setCv} onRemove={() => setCv(null)}
            error={fileErrors.cv}
          />
          <FileUploadBox
            id="upload-proposal" label="Proposal Magang" required
            hint="Proposal rencana kegiatan magang (PDF)"
            value={proposal} onChange={setProposal} onRemove={() => setProposal(null)}
            error={fileErrors.proposal}
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit" disabled={isSubmitting} id="daftar-magang-submit-btn"
        className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md mt-4"
      >
        {isSubmitting
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim lamaran...</>
          : <>Kirim Lamaran Magang</>
        }
      </Button>

      <p className="text-center text-muted-foreground text-xs pt-1">
        Dengan mendaftar, kamu menyetujui bahwa data yang diisi adalah benar dan dapat dipertanggungjawabkan.
      </p>
    </form>
  );
}
