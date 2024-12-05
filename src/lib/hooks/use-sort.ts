import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

interface UseSortOptions<T> {
  initialSortField?: keyof T;
  initialDirection?: SortDirection;
}

export function useSort<T extends Record<string, any>>({
  initialSortField,
  initialDirection = 'asc',
}: UseSortOptions<T> = {}) {
  const [sortField, setSortField] = useState<keyof T | undefined>(initialSortField);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);

  const sort = useMemo(() => {
    return (items: T[]): T[] => {
      if (!sortField) return items;

      return [...items].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    };
  }, [sortField, direction]);

  const toggleSort = (field: keyof T) => {
    if (field === sortField) {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setDirection('asc');
    }
  };

  return {
    sortField,
    direction,
    toggleSort,
    sort,
  };
}