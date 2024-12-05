import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Notification = Database['public']['Tables']['notifications']['Row'];

export async function getNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationAsRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  
  if (error) throw error;
}

export async function createNotification(data: {
  title: string;
  message: string;
  user_id: string;
}) {
  const { error } = await supabase.from('notifications').insert([{
    ...data,
    read: false,
    created_at: new Date().toISOString(),
  }]);
  
  if (error) throw error;
}