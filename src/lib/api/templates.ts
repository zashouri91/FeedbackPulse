import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Template = Database['public']['Tables']['templates']['Row'];

export async function getTemplates() {
  const { data, error } = await supabase.from('templates').select('*').order('name');

  if (error) throw error;
  return data as Template[];
}

export async function createTemplate(data: {
  name: string;
  description: string;
  questions: any[];
}) {
  const { error } = await supabase.from('templates').insert([data]);
  if (error) throw error;
}

export async function updateTemplate(id: string, data: Partial<Template>) {
  const { error } = await supabase.from('templates').update(data).eq('id', id);

  if (error) throw error;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase.from('templates').delete().eq('id', id);

  if (error) throw error;
}
