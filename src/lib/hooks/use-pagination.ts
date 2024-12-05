import { useState } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginate = <T>(items: T[]): T[] => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  };

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    paginate,
  };
}