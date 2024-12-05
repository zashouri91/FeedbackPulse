import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { User } from '@supabase/supabase-js';

export type AuditAction = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'role.changed'
  | 'survey.created'
  | 'survey.updated'
  | 'survey.deleted'
  | 'response.submitted'
  | 'group.created'
  | 'group.updated'
  | 'group.deleted'
  | 'location.created'
  | 'location.updated'
  | 'location.deleted';

export async function createAuditLog(data: {
  action: AuditAction;
  user: User;
  details: Record<string, any>;
}) {
  // Use admin client to bypass RLS
  const { error } = await supabaseAdmin.from('audit_logs').insert([{
    action: data.action,
    user_id: data.user.id,
    user_email: data.user.email,
    user_role: data.user.user_metadata?.role || 'user',
    details: data.details,
    created_at: new Date().toISOString(),
  }]);

  if (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
}

export async function getAuditLogs(options?: {
  limit?: number;
  offset?: number;
  action?: AuditAction;
  userId?: string;
}) {
  // Use admin client to bypass RLS
  let query = supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.action) {
    query = query.eq('action', options.action);
  }

  if (options?.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting audit logs:', error);
    throw error;
  }

  return data;
}