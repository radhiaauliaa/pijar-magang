// features/log/components/LogPage.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import api from "@/services/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePagination } from "@/hooks/usePagination";
import { formatDateTime } from "@/lib/utils";
import type { PaginatedResponse } from "@/types";

interface LogEntry {
  id: string;
  user: string;
  aktivitas: string;
  tanggal: string;
}

async function getLogs(page: number, limit: number): Promise<PaginatedResponse<LogEntry>["data"]> {
  const res = await api.get<PaginatedResponse<LogEntry>>("", {
    params: { action: "getLog", page, limit },
  });
  return res.data.data ?? { items: [], total: 0, page, limit, totalPages: 0 };
}


export function LogPage() {
  const { page, limit, setPage, setLimit } = usePagination();

  const { data, isLoading } = useQuery({
    queryKey: ["log-aktivitas", page, limit],
    queryFn: () => getLogs(page, limit),
    refetchInterval: 30_000,
  });

  const columns: Column<LogEntry>[] = [
    { key: "tanggal", title: "Waktu", render: (r) => formatDateTime(r.tanggal) },
    { key: "user", title: "User" },
    { key: "aktivitas", title: "Aktivitas" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Log Aktivitas" description="Audit trail semua aktivitas di sistem" />
      <DataTable
        data={data?.items ?? []}
        columns={columns}
        loading={isLoading}
        page={page}
        limit={limit}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onLimitChange={setLimit}
        rowKey="id"
        emptyState={<EmptyState icon={Activity} title="Belum ada log" description="Log aktivitas akan muncul di sini" />}
      />
    </div>
  );
}
