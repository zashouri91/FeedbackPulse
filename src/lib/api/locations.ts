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
    // Get user from regular client to ensure we have an authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new Error(`Failed to get user: ${userError.message}`);
    if (!user) throw new Error('No authenticated user');
    if (!user.id) throw new Error('User ID is missing');

    // Check if user has the required role
    const userRole = user.user_metadata?.role;
    if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
      throw new Error('Insufficient permissions to create location');
    }

    // Create the location using a database function that handles both location creation and audit logging
    const { data: locationData, error: locationError } = await supabaseAdmin
      .rpc('create_location_with_audit', {
        location_name: data.name,
        location_managers: data.managers,
        audit_user_id: user.id,
        audit_user_email: user.email || '',
        audit_user_role: userRole
      });

    if (locationError) {
      console.error('Location creation error:', locationError);
      throw locationError;
    }

    return locationData;
  } catch (error) {
    console.error('Error in createLocation:', error);
    throw error;
  }
}

export async function updateLocation(id: string, data: Partial<Location>) {
  try {
    // Get user from regular client
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new Error(`Failed to get user: ${userError.message}`);
    if (!user) throw new Error('No authenticated user');
    if (!user.id) throw new Error('User ID is missing');

    // Check if user has the required role
    const userRole = user.user_metadata?.role;
    if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
      throw new Error('Insufficient permissions to update location');
    }

    // Ensure managers is an array if it exists
    const locationData = {
      ...data,
      managers: Array.isArray(data.managers) ? data.managers : []
    };

    // Update the location using database function that handles both update and audit logging
    const { data: updatedLocationData, error: locationError } = await supabaseAdmin
      .rpc('update_location_with_audit', {
        location_id: id,
        location_data: locationData,
        audit_user_id: user.id,
        audit_user_email: user.email || '',
        audit_user_role: userRole
      });

    if (locationError) {
      console.error('Location update error:', locationError);
      throw locationError;
    }

    return updatedLocationData;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
}

export async function deleteLocation(id: string) {
  try {
    // Get user from regular client
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw new Error(`Failed to get user: ${userError.message}`);
    if (!user) throw new Error('No authenticated user');
    if (!user.id) throw new Error('User ID is missing');

    // Check if user has the required role
    const userRole = user.user_metadata?.role;
    if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
      throw new Error('Insufficient permissions to delete location');
    }

    // Delete the location using database function that handles both deletion and audit logging
    const { data: locationData, error: locationError } = await supabaseAdmin
      .rpc('delete_location_with_audit', {
        location_id: id,
        audit_user_id: user.id,
        audit_user_email: user.email || '',
        audit_user_role: userRole
      });

    if (locationError) {
      console.error('Location deletion error:', locationError);
      throw locationError;
    }

    return locationData;
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
}