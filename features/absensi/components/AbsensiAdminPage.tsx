// features/absensi/components/AbsensiAdminPage.tsx
"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, Calendar, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { absensiService } from "@/services/absensi.service";
import { mahasiswaService } from "@/services/mahasiswa.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import * as XLSX from "xlsx";
import { getErrorMessage } from "@/services/api";
import type { Kehadiran, Mahasiswa } from "@/types";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function AbsensiAdminPage() {
  const { user } = useAuth();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()); // 0-indexed
  const [search, setSearch] = useState("");
  const [mobileShowAllDays, setMobileShowAllDays] = useState(false);

  const todayDay = useMemo(() => {
    if (selectedYear === now.getFullYear() && selectedMonth === now.getMonth()) {
      return now.getDate();
    }
    return 1;
  }, [selectedYear, selectedMonth]);

  const { data: mhsResponse, isLoading: isMhsLoading } = useQuery({
    queryKey: ["mahasiswa", 1, 500],
    queryFn: () => mahasiswaService.getAll({ page: 1, limit: 500 }),
  });

  const { data: absensiResponse, isLoading: isAbsensiLoading } = useQuery({
    queryKey: ["absensi", 1, 1000],
    queryFn: () => absensiService.getAll({ page: 1, limit: 1000 }),
  });

  const mahasiswaList = mhsResponse?.items ?? [];
  const attendanceList = absensiResponse?.items ?? [];

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  const filteredStudents = useMemo(() => {
    return mahasiswaList.filter((mhs) => {
      if (user?.role === "pembimbing") {
        const isPembimbingMatch =
          mhs.pembimbing === user.id ||
          mhs.pembimbing === user.email ||
          (user.id && mhs.pembimbing && String(mhs.pembimbing).toLowerCase() === String(user.id).toLowerCase()) ||
          (user.email && mhs.pembimbing && String(mhs.pembimbing).toLowerCase() === String(user.email).toLowerCase());
        const isDivisiMatch = user.divisi && mhs.divisi === user.divisi;
        if (!isPembimbingMatch && !isDivisiMatch) return false;
      }
      const matchSearch =
        search === "" ||
        (mhs.nama + mhs.nim + mhs.universitas).toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [mahasiswaList, search, user]);

  const getAttendanceForDay = (mhsOrId: Mahasiswa | string, day: number): Kehadiran | undefined => {
    const dayStr = String(day).padStart(2, "0");
    const monthStr = String(selectedMonth + 1).padStart(2, "0");
    const targetDateStr = `${selectedYear}-${monthStr}-${dayStr}`;

    const mhs = typeof mhsOrId === "string" ? mahasiswaList.find((m) => m.id === mhsOrId) : mhsOrId;
    const mhsId = typeof mhsOrId === "string" ? mhsOrId : mhsOrId.id;

    return attendanceList.find((att) => {
      const isMhsMatch =
        att.mahasiswa_id === mhsId ||
        ((mhs as any)?.user_id && att.mahasiswa_id === (mhs as any).user_id) ||
        (mhs?.email && att.mahasiswa_id === mhs.email) ||
        (att as any).mahasiswa_nama === mhs?.nama ||
        (att as any).mahasiswa_nama === mhsId;
      if (!isMhsMatch) return false;

      const rawDate = String(att.tanggal || "").slice(0, 10);
      if (rawDate === targetDateStr) return true;

      try {
        const d = new Date(att.tanggal);
        if (!isNaN(d.getTime())) {
          return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && d.getDate() === day;
        }
      } catch {}

      return false;
    });
  };

  const monthlySummary = useMemo(() => {
    let hadir = 0;
    let terlambat = 0;
    let izinSakit = 0;
    let alpha = 0;

    filteredStudents.forEach((mhs) => {
      daysArray.forEach((day) => {
        const att = getAttendanceForDay(mhs, day);
        if (att) {
          const st = String(att.status || "").toLowerCase();
          if (st === "hadir") hadir++;
          else if (st === "terlambat") terlambat++;
          else if (st === "izin" || st === "sakit") izinSakit++;
          else if (st === "alpha") alpha++;
        }
      });
    });

    return {
      hadir,
      terlambat,
      izinSakit,
      alpha,
      total: hadir + terlambat + izinSakit + alpha,
    };
  }, [filteredStudents, daysArray, attendanceList, selectedMonth, selectedYear]);

  // Export to Excel Matrix (.xlsx) with neat table layout & merged headers
  const handleExportCSV = () => {
    try {
      if (filteredStudents.length === 0) {
        toast.error("Tidak ada data mahasiswa untuk di-export");
        return;
      }

      const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
      const dayHeaders = daysArray.map((d) => String(d).padStart(2, "0"));

      // Header Rows matching Web UI (Gambar 3)
      const headerRow1 = ["No", "Nama Mahasiswa", `Hari (${monthLabel})`, ...Array(Math.max(0, daysArray.length - 1)).fill("")];
      const headerRow2 = ["", "", ...dayHeaders];

      const rowsData = filteredStudents.map((mhs, idx) => {
        const dayValues = daysArray.map((day) => {
          const att = getAttendanceForDay(mhs, day);
          if (!att) return "-";
          const st = String(att.status || "").toLowerCase();
          if (st === "hadir") return "Hadir";
          if (st === "terlambat") return "Terlambat";
          if (st === "izin") return "Izin";
          if (st === "sakit") return "Sakit";
          if (st === "alpha") return "Alpha";
          return att.status;
        });
        return [idx + 1, mhs.nama, ...dayValues];
      });

      const summaryRows = [
        [],
        ["RINGKASAN KEHADIRAN"],
        ["Hadir", monthlySummary.hadir],
        ["Terlambat", monthlySummary.terlambat],
        ["Izin/Sakit", monthlySummary.izinSakit],
        ["Alpha", monthlySummary.alpha || 0],
        ["Total Kehadiran", monthlySummary.total],
      ];

      const sheetData = [
        [`Daftar Hadir Mahasiswa PIJAR - PLN UP3 PADANG`],
        [`Bulan : ${monthLabel}`],
        [],
        headerRow1,
        headerRow2,
        ...rowsData,
        ...summaryRows,
      ];

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // Apply Merges matching Web UI (Gambar 3)
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Subtitle
        { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, // Merge "No" (A4:A5)
        { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // Merge "Nama Mahasiswa" (B4:B5)
        { s: { r: 3, c: 2 }, e: { r: 3, c: 1 + daysArray.length } }, // Merge "Hari (Bulan Tahun)" (C4:AG4)
      ];

      // Auto-fit Column Widths
      const colWidths = [
        { wch: 6 },  // No
        { wch: 30 }, // Nama Mahasiswa
        ...daysArray.map(() => ({ wch: 7 })), // Day columns (01, 02...)
      ];
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Daftar Hadir");

      XLSX.writeFile(wb, `Daftar_Hadir_Mahasiswa_${monthLabel.replace(/\s+/g, "_")}.xlsx`);
      toast.success("Daftar Hadir Mahasiswa berhasil di-export ke Excel Spreadsheet!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const isLoading = isMhsLoading || isAbsensiLoading;

  return (
    <div className="space-y-6">
      <PageHeader title="Data Absensi" description="Rekap kehadiran seluruh mahasiswa magang">
        <Button className="bg-black hover:bg-black/80 text-white font-medium text-xs h-9 px-4 rounded-xl shadow-xs" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Header Document Style */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Daftar Hadir Mahasiswa</h2>
          <p className="text-sm font-semibold text-primary">PIJAR – PLN UP3 PADANG</p>
        </div>

        {/* Filters: Month Picker & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground shrink-0">Bulan :</span>
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="w-40 font-medium">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((name, idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-28 font-medium">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama mahasiswa..."
              className="pl-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile View Mode Toggle */}
        <div className="flex md:hidden items-center justify-between gap-2 pb-1">
          <div className="text-xs font-semibold text-muted-foreground">
            {mobileShowAllDays ? "Menampilkan semua tanggal (1-31)" : `Absensi Hari Ini: ${todayDay} ${MONTH_NAMES[selectedMonth]}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2.5 rounded-lg border-border font-bold text-sky-700 dark:text-sky-400 shrink-0"
            onClick={() => setMobileShowAllDays(!mobileShowAllDays)}
          >
            {mobileShowAllDays ? "📱 Tampilkan Hari Ini" : "📊 Lihat Semua (1-31)"}
          </Button>
        </div>

        {/* Matrix Table */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Memuat rekap absensi...</div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState title="Belum ada mahasiswa" description="Data mahasiswa akan muncul di sini" />
        ) : (
          <div>
            {/* Mobile Today-Only Table (< md, default when !mobileShowAllDays) */}
            {!mobileShowAllDays && (
              <div className="block md:hidden overflow-hidden rounded-xl border border-border">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border font-bold text-foreground">
                      <th className="p-2.5 w-10 text-center border-r border-border">No</th>
                      <th className="p-2.5 border-r border-border">Nama Mahasiswa</th>
                      <th className="p-2.5 text-center w-28">Status ({todayDay} {MONTH_NAMES[selectedMonth].slice(0, 3)})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((mhs, idx) => {
                      const att = getAttendanceForDay(mhs, todayDay);
                      let cellBadge = <span className="text-muted-foreground/60 font-medium">-</span>;

                      if (att) {
                        const st = String(att.status || "").toLowerCase();
                        if (st === "hadir") {
                          cellBadge = <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">Hadir</span>;
                        } else if (st === "terlambat") {
                          cellBadge = <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[11px]">Terlambat</span>;
                        } else if (st === "izin" || st === "sakit") {
                          cellBadge = <span className="inline-block px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-[11px]">{att.jenis_izin === "Sakit" ? "Sakit" : "Izin"}</span>;
                        } else if (st === "alpha") {
                          cellBadge = <span className="inline-block px-2 py-0.5 rounded-md bg-red-500/10 text-red-700 dark:text-red-400 font-bold text-[11px]">Alpha</span>;
                        }
                      }

                      return (
                        <tr key={mhs.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="p-2.5 text-center font-medium border-r border-border">{idx + 1}</td>
                          <td className="p-2.5 border-r border-border">
                            <p className="font-bold text-foreground leading-tight">{mhs.nama}</p>
                            <p className="text-[10px] text-muted-foreground">{mhs.universitas || mhs.nim}</p>
                          </td>
                          <td className="p-2.5 text-center">
                            {cellBadge}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Desktop Full Table (Or Mobile when mobileShowAllDays = true) */}
            {(mobileShowAllDays || typeof window === "undefined") && (
              <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border font-bold text-foreground">
                      <th rowSpan={2} className="p-3 w-12 text-center border-r border-border align-middle sticky left-0 z-20 bg-muted">No</th>
                      <th rowSpan={2} className="p-3 min-w-[180px] border-r-2 border-border align-middle sticky left-12 z-20 bg-muted shadow-xs">Nama Mahasiswa</th>
                      <th colSpan={daysInMonth} className="p-2 text-center border-b border-border">
                        Hari ({MONTH_NAMES[selectedMonth]} {selectedYear})
                      </th>
                    </tr>
                    <tr className="bg-muted/30 border-b border-border text-center font-bold text-muted-foreground">
                      {daysArray.map((day) => (
                        <th key={day} className="p-1.5 w-9 border-r border-border min-w-[32px]">
                          {String(day).padStart(2, "0")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((mhs, idx) => (
                      <tr key={mhs.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="p-2.5 text-center font-medium border-r border-border sticky left-0 z-10 bg-card">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-foreground border-r-2 border-border whitespace-nowrap sticky left-12 z-10 bg-card shadow-xs">
                          {mhs.nama}
                        </td>
                        {daysArray.map((day) => {
                          const att = getAttendanceForDay(mhs, day);
                          if (!att) {
                            return (
                              <td key={day} className="p-1.5 text-center text-muted-foreground/40 border-r border-border">
                                -
                              </td>
                            );
                          }

                          const st = String(att.status || "").toLowerCase();
                          let cellColor = "text-foreground font-medium";
                          let textLabel = "Hadir";

                          if (st === "hadir") {
                            cellColor = "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10";
                            textLabel = "Hadir";
                          } else if (st === "terlambat") {
                            cellColor = "text-amber-700 dark:text-amber-400 font-bold bg-amber-500/10";
                            textLabel = "Terlambat";
                          } else if (st === "izin" || st === "sakit") {
                            cellColor = "text-blue-700 dark:text-blue-400 font-bold bg-blue-500/10";
                            textLabel = att.jenis_izin === "Sakit" ? "Sakit" : "Izin";
                          } else if (st === "alpha") {
                            cellColor = "text-red-700 dark:text-red-400 font-bold bg-red-500/10";
                            textLabel = "Alpha";
                          }

                          return (
                            <td key={day} className={`p-1 text-center border-r border-border text-[11px] ${cellColor}`} title={`${formatDate(att.tanggal)}: ${textLabel}`}>
                              {textLabel}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile fallback when mobileShowAllDays = true */}
            {mobileShowAllDays && (
              <div className="block md:hidden overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border font-bold text-foreground">
                      <th rowSpan={2} className="p-3 w-12 text-center border-r border-border align-middle sticky left-0 z-20 bg-muted">No</th>
                      <th rowSpan={2} className="p-3 min-w-[150px] border-r-2 border-border align-middle sticky left-12 z-20 bg-muted shadow-xs">Nama Mahasiswa</th>
                      <th colSpan={daysInMonth} className="p-2 text-center border-b border-border">
                        Hari ({MONTH_NAMES[selectedMonth]} {selectedYear})
                      </th>
                    </tr>
                    <tr className="bg-muted/30 border-b border-border text-center font-bold text-muted-foreground">
                      {daysArray.map((day) => (
                        <th key={day} className="p-1.5 w-9 border-r border-border min-w-[32px]">
                          {String(day).padStart(2, "0")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((mhs, idx) => (
                      <tr key={mhs.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="p-2.5 text-center font-medium border-r border-border sticky left-0 z-10 bg-card">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-foreground border-r-2 border-border whitespace-nowrap sticky left-12 z-10 bg-card shadow-xs">
                          {mhs.nama}
                        </td>
                        {daysArray.map((day) => {
                          const att = getAttendanceForDay(mhs, day);
                          if (!att) {
                            return (
                              <td key={day} className="p-1.5 text-center text-muted-foreground/40 border-r border-border">
                                -
                              </td>
                            );
                          }

                          const st = String(att.status || "").toLowerCase();
                          let cellColor = "text-foreground font-medium";
                          let textLabel = "Hadir";

                          if (st === "hadir") {
                            cellColor = "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10";
                            textLabel = "Hadir";
                          } else if (st === "terlambat") {
                            cellColor = "text-amber-700 dark:text-amber-400 font-bold bg-amber-500/10";
                            textLabel = "Terlambat";
                          } else if (st === "izin" || st === "sakit") {
                            cellColor = "text-blue-700 dark:text-blue-400 font-bold bg-blue-500/10";
                            textLabel = att.jenis_izin === "Sakit" ? "Sakit" : "Izin";
                          } else if (st === "alpha") {
                            cellColor = "text-red-700 dark:text-red-400 font-bold bg-red-500/10";
                            textLabel = "Alpha";
                          }

                          return (
                            <td key={day} className={`p-1 text-center border-r border-border text-[11px] ${cellColor}`} title={`${formatDate(att.tanggal)}: ${textLabel}`}>
                              {textLabel}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Ringkasan Kehadiran */}
        <div className="pt-4 border-t border-border">
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-sm tracking-tight text-foreground uppercase">RINGKASAN KEHADIRAN</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-w-xs text-foreground font-medium">
              <div>Hadir</div>
              <div>: <strong className="text-emerald-600">{monthlySummary.hadir}</strong></div>
              <div>Terlambat</div>
              <div>: <strong className="text-amber-600">{monthlySummary.terlambat}</strong></div>
              <div>Izin/Sakit</div>
              <div>: <strong className="text-blue-600">{monthlySummary.izinSakit}</strong></div>
              <div>Alpha</div>
              <div>: <strong>{monthlySummary.alpha || "-"}</strong></div>
              <div className="pt-1 font-bold border-t border-border">Total Kehadiran</div>
              <div className="pt-1 font-bold border-t border-border">: {monthlySummary.total}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
