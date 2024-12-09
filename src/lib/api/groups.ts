import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Database } from '@/types/supabase';

type Group = Database['public']['Tables']['groups']['Row'];

export async function getGroups() {
  const { data, error } = await supabaseAdmin
    .from('groups')
    .select(
      `
      *,
      manager:users!groups_manager_id_fkey(email),
      location:locations!groups_location_id_fkey(name)
    `
    )
    .order('name');

  if (error) throw error;
  return data as Group[];
}

export async function createGroup(data: { name: string; manager_id: string; location_id: string }) {
  try {
    const timestamp = new Date().toISOString();

    // Create the group using supabaseAdmin
    const { data: groupData, error: groupError } = await supabaseAdmin
      .from('groups')
      .insert({
        name: data.name,
        manager_id: data.manager_id,
        location_id: data.location_id,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();

    if (groupError) {
      console.error('Group creation error:', groupError);
      throw groupError;
    }

    // Get the current user for audit log
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User fetch error:', userError);
      // Don't throw here as the group was created successfully
    }

    // Create audit log entry if we have user info
    if (user) {
      const { error: auditError } = await supabaseAdmin.from('audit_logs').insert({
        table_name: 'groups',
        record_id: groupData.id,
        operation: 'create',
        old_data: null,
        new_data: groupData,
        user_id: user.id,
        user_email: user.email,
        user_role: user.user_metadata?.role || 'user',
        created_at: timestamp,
      });

      if (auditError) {
        console.error('Audit log error:', auditError);
        // Don't throw here as the group was created successfully
      }
    }

    return groupData;
  } catch (error) {
    console.error('Error in createGroup:', error);
    throw error;
  }
}

export async function updateGroup(id: string, data: Partial<Group>) {
  try {
    // Get user from regular client
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(`Failed to get user: ${userError.message}`);
    if (!user) throw new Error('No authenticated user');
    if (!user.id) throw new Error('User ID is missing');

    // Check if user has the required role
    const userRole = user.user_metadata?.role;
    if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
      throw new Error('Insufficient permissions to update group');
    }

    const timestamp = new Date().toISOString();

    // Get the old data first
    const { data: oldData, error: oldDataError } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();

    if (oldDataError) throw oldDataError;

    // Update the group
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('groups')
      .update({
        ...data,
        updated_at: timestamp,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Group update error:', updateError);
      throw updateError;
    }

    // Create audit log entry
    const { error: auditError } = await supabaseAdmin.from('audit_logs').insert({
      table_name: 'groups',
      record_id: id,
      operation: 'update',
      old_data: oldData,
      new_data: updatedData,
      user_id: user.id,
      user_email: user.email,
      user_role: userRole,
      created_at: timestamp,
    });

    if (auditError) {
      console.error('Audit log error:', auditError);
    }

    return updatedData;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
}

export async function deleteGroup(id: string) {
  try {
    // Get user from regular client
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw new Error(`Failed to get user: ${userError.message}`);
    if (!user) throw new Error('No authenticated user');
    if (!user.id) throw new Error('User ID is missing');

    // Check if user has the required role
    const userRole = user.user_metadata?.role;
    if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
      throw new Error('Insufficient permissions to delete group');
    }

    const timestamp = new Date().toISOString();

    // Get the data before deletion
    const { data: oldData, error: oldDataError } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();

    if (oldDataError) throw oldDataError;

    // Delete the group
    const { error: deleteError } = await supabaseAdmin.from('groups').delete().eq('id', id);

    if (deleteError) {
      console.error('Group deletion error:', deleteError);
      throw deleteError;
    }

    // Create audit log entry
    const { error: auditError } = await supabaseAdmin.from('audit_logs').insert({
      table_name: 'groups',
      record_id: id,
      operation: 'delete',
      old_data: oldData,
      new_data: null,
      user_id: user.id,
      user_email: user.email,
      user_role: userRole,
      created_at: timestamp,
    });

    if (auditError) {
      console.error('Audit log error:', auditError);
    }

    return oldData;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
}
