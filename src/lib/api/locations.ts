import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Database } from '@/types/supabase';
import { createAuditLog } from './audit-logs';

type Location = Database['public']['Tables']['locations']['Row'];

export async function getLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Location[];
}

export async function createLocation(data: { name: string; managers: string[] }) {
  try {
    // Get user from regular client
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Use admin client to bypass RLS
    const { data: locationData, error } = await supabaseAdmin
      .from('locations')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await createAuditLog({
      action: 'location.created',
      user,
      details: data,
    });

    return locationData;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
}

export async function updateLocation(id: string, data: Partial<Location>) {
  try {
    // Get user from regular client
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Use admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from('locations')
      .update(data)
      .eq('id', id);
    
    if (error) throw error;

    // Create audit log
    await createAuditLog({
      action: 'location.updated',
      user,
      details: { id, ...data },
    });
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
}

export async function deleteLocation(id: string) {
  try {
    // Get user from regular client
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Use admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;

    // Create audit log
    await createAuditLog({
      action: 'location.deleted',
      user,
      details: { id },
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
}