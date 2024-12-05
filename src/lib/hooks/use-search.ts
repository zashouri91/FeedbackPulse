import { useState, useMemo } from 'react';
import { useDebounce } from './use-debounce';

interface UseSearchOptions<T> {
  searchFields: (keyof T)[];
  debounceMs?: number;
}

export function useSearch<T extends Record<string, any>>({
  searchFields,
  debounceMs = 300,
}: UseSearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const search = useMemo(() => {
    return (items: T[]): T[] => {
      if (!debouncedSearchTerm) return items;

      return items.filter((item) =>
        searchFields.some((field) =>
          String(item[field])
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
        )
      );
    };
  }, [debouncedSearchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    search,
  };
}