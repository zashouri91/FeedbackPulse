-- Create audit trigger function
create or replace function audit_trigger_function()
returns trigger as $$
declare
  user_email text;
  user_role text;
begin
  -- Get user email and role
  select email, role into user_email, user_role
  from auth.users
  where id = auth.uid();

  -- Insert audit log
  insert into public.audit_logs (
    action,
    user_id,
    user_email,
    user_role,
    details
  ) values (
    TG_ARGV[0] || '.' || TG_OP,
    auth.uid(),
    user_email,
    user_role,
    case
      when TG_OP = 'DELETE' then row_to_json(OLD)::jsonb
      else row_to_json(NEW)::jsonb
    end
  );

  return null;
end;
$$ language plpgsql security definer;

-- Create audit triggers for each table
create trigger locations_audit_trigger
  after insert or update or delete on public.locations
  for each row execute function audit_trigger_function('location');

create trigger groups_audit_trigger
  after insert or update or delete on public.groups
  for each row execute function audit_trigger_function('group');

create trigger users_audit_trigger
  after insert or update or delete on public.users
  for each row execute function audit_trigger_function('user');

create trigger surveys_audit_trigger
  after insert or update or delete on public.surveys
  for each row execute function audit_trigger_function('survey');

create trigger responses_audit_trigger
  after insert or update or delete on public.responses
  for each row execute function audit_trigger_function('response');

create trigger templates_audit_trigger
  after insert or update or delete on public.templates
  for each row execute function audit_trigger_function('template');