import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Group = Database['public']['Tables']['groups']['Row'];

export async function getGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Group[];
}

export async function createGroup(data: {
  name: string;
  manager_id: string;
  location_id: string;
}) {
  const { error } = await supabase.from('groups').insert([data]);
  if (error) throw error;
}

export async function updateGroup(id: string, data: Partial<Group>) {
  const { error } = await supabase
    .from('groups')
    .update(data)
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteGroup(id: string) {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}