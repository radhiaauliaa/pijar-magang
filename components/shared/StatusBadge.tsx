// components/shared/StatusBadge.tsx
import { cn } from "@/lib/utils";
import type { AbsensiStatus, JurnalStatus, MahasiswaStatus } from "@/types";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  aktif:      { label: "Aktif",         className: "badge-aktif" },
  selesai:    { label: "Selesai",       className: "badge-selesai" },
  dropout:    { label: "Dropout",       className: "badge-dropout" },
  hadir:      { label: "Hadir",         className: "badge-hadir" },
  terlambat:  { label: "Terlambat",     className: "badge-terlambat" },
  izin:       { label: "Izin",          className: "badge-izin" },
  sakit:      { label: "Sakit",         className: "badge-sakit" },
  alpha:      { label: "Alpha",         className: "badge-alpha" },
  draft:      { label: "Draft",         className: "badge-draft" },
  submitted:  { label: "Menunggu",      className: "badge-submitted" },
  verified:   { label: "Disetujui",     className: "badge-verified" },
  approved:   { label: "Disetujui",     className: "badge-verified" },
  disetujui:  { label: "Disetujui",     className: "badge-verified" },
  rejected:   { label: "Ditolak",        className: "badge-alpha" },
  ditolak:    { label: "Ditolak",        className: "badge-alpha" },
};

interface StatusBadgeProps {
  status: MahasiswaStatus | AbsensiStatus | JurnalStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
