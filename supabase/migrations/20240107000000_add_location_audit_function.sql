-- Create a function to handle location creation with audit logging
create or replace function create_location_with_audit(
  location_name text,
  location_managers uuid[],
  audit_user_id uuid,
  audit_user_email text,
  audit_user_role text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  new_location record;
begin
  -- Insert the location
  insert into locations (name, managers)
  values (location_name, location_managers)
  returning * into new_location;

  -- Create audit log entry
  insert into audit_logs (
    action,
    user_id,
    user_email,
    user_role,
    details,
    created_at
  ) values (
    'location.created',
    audit_user_id,
    audit_user_email,
    audit_user_role,
    jsonb_build_object(
      'id', new_location.id,
      'name', new_location.name,
      'managers', new_location.managers
    ),
    now()
  );

  return row_to_json(new_location);
end;
$$;
