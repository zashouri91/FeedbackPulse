import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];

export async function getUsers() {
  try {
    // Use supabaseAdmin to bypass RLS and get all users
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(
        `
        *,
        location:locations(name)
      `
      )
      .order('email');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function createUser(data: {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  location_id: string;
  groups: string[];
}) {
  try {
    // Get user from regular client to ensure we have an authenticated user
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
      throw new Error('Insufficient permissions to create user');
    }

    // Create auth user first
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
      user_metadata: { role: data.role },
    });

    if (authError) throw authError;
    if (!authUser.user) throw new Error('Failed to create auth user');

    // Then create the user record in our users table
    const timestamp = new Date().toISOString();
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        role: data.role,
        location_id: data.location_id,
        groups: data.groups,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();

    if (dbError) {
      // If user table insert fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw dbError;
    }

    return {
      ...dbUser,
      tempPassword: authUser.user.email, // In a real app, you'd generate a random password
    };
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

export async function updateUser(
  id: string,
  data: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    role?: string;
    location_id?: string;
    groups?: string[];
  }
) {
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
      throw new Error('Insufficient permissions to update user');
    }

    const timestamp = new Date().toISOString();
    const updates = {
      ...data,
      updated_at: timestamp,
    };

    // Update auth user if email or role changed
    if (data.email || data.role) {
      const authUpdates: any = {};
      if (data.email) authUpdates.email = data.email;
      if (data.role) authUpdates.user_metadata = { role: data.role };

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);

      if (authError) throw authError;
    }

    // Update user record
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (dbError) throw dbError;

    return dbUser;
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
}

export async function deleteUser(id: string) {
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
      throw new Error('Insufficient permissions to delete user');
    }

    // Delete the user using database function that handles both deletion and audit logging
    const { data: deletedUserData, error: deleteError } = await supabaseAdmin.rpc(
      'delete_user_with_audit',
      {
        user_id: id,
        audit_user_id: user.id,
        audit_user_email: user.email || '',
        audit_user_role: userRole,
      }
    );

    if (deleteError) {
      console.error('User deletion error:', deleteError);
      throw deleteError;
    }

    return deletedUserData;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function getAssignableUsers(groupId: string, locationId: string) {
  try {
    const { data, error } = await supabase.rpc('get_assignable_users', {
      p_group_id: groupId,
      p_location_id: locationId,
    });

    if (error) {
      console.error('Error loading assignees:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getAssignableUsers:', error);
    throw error;
  }
}
