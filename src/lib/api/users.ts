import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Database } from '@/types/supabase';
import { createAuditLog } from './audit-logs';
import { handleError } from '@/lib/utils/error-handler';

type User = Database['public']['Tables']['users']['Row'];

export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('email');
    
    if (error) throw error;
    return data as User[];
  } catch (error) {
    throw handleError(error, 'Failed to fetch users');
  }
}

export async function createUser(data: {
  email: string;
  role: string;
  groups: string[];
  location_id: string;
}) {
  try {
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create the auth user with the service role client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: data.role
      }
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('Failed to create auth user');
    }

    // Create the user record in the database
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email: data.email,
        role: data.role,
        groups: data.groups,
        location_id: data.location_id
      }]);

    if (dbError) {
      // If database insert fails, try to clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    await createAuditLog({
      action: 'user.created',
      user: (await supabase.auth.getUser()).data.user!,
      details: { ...data, tempPassword },
    });

    // Return the temporary password so it can be communicated to the user
    return { 
      user: authData.user,
      tempPassword 
    };
  } catch (error) {
    throw handleError(error, 'Failed to create user');
  }
}

export async function updateUser(id: string, data: Partial<User>) {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id);
    
    if (error) throw error;

    await createAuditLog({
      action: 'user.updated',
      user: (await supabase.auth.getUser()).data.user!,
      details: { id, ...data },
    });
  } catch (error) {
    throw handleError(error, 'Failed to update user');
  }
}

export async function deleteUser(id: string) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;

    await createAuditLog({
      action: 'user.deleted',
      user: (await supabase.auth.getUser()).data.user!,
      details: { id },
    });
  } catch (error) {
    throw handleError(error, 'Failed to delete user');
  }
}