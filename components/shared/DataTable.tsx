// components/shared/DataTable.tsx
"use client";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CONFIG } from "@/constants/config";

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  emptyState?: React.ReactNode;
  rowKey: keyof T;
}

export function DataTable<T extends object>({
  data,
  columns,
  loading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  emptyState,
  rowKey,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left font-semibold text-muted-foreground ${col.className ?? ""}`}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: limit }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? (
                  <tr>
                    <td colSpan={columns.length} className="py-2">
                      {emptyState}
                    </td>
                  </tr>
                )
              : data.map((row) => (
                  <tr
                    key={String(row[rowKey])}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={String(col.key)} className={`px-4 py-3 ${col.className ?? ""}`}>
                        {col.render
                          ? col.render(row)
                          : String(row[col.key as keyof T] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Menampilkan {start}–{end} dari {total} data</span>
            {onLimitChange && (
              <div className="flex items-center gap-2">
                <span>|</span>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => { onLimitChange(Number(v)); onPageChange(1); }}
                >
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONFIG.PAGE_SIZE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={String(s)}>{s} / hal</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(1)} disabled={page === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-medium">{page} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
