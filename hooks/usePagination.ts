// hooks/usePagination.ts
import { useState, useCallback } from "react";
import { CONFIG } from "@/constants/config";

export function usePagination(initialPage = 1, initialLimit = CONFIG.DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);

  const goToPage = useCallback((p: number) => setPage(p), []);
  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const reset = useCallback(() => setPage(1), []);

  return { page, limit, setPage, setLimit, goToPage, nextPage, prevPage, reset };
}
