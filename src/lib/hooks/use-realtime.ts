import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type RealtimeSubscription = {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  filter?: string;
};

export function useRealtimeSubscription({
  table,
  onInsert,
  onUpdate,
  onDelete,
  filter,
}: RealtimeSubscription) {
  const handleChange = useCallback(
    (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          onInsert?.(newRecord);
          break;
        case 'UPDATE':
          onUpdate?.(newRecord);
          break;
        case 'DELETE':
          onDelete?.(oldRecord);
          break;
      }
    },
    [onInsert, onUpdate, onDelete]
  );

  useEffect(() => {
    const channel = supabase
      .channel('table-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        handleChange
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          toast.success(`Connected to ${table} updates`);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [table, filter, handleChange]);
}
