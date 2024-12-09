-- Create the function for creating groups with audit logging
create or replace function create_group_with_audit(
  group_name text,
  group_manager_id uuid,
  group_location_id uuid,
  audit_user_id uuid,
  audit_user_email text,
  audit_user_role text
) returns jsonb
language plpgsql
security definer
as $$
declare
  new_group jsonb;
begin
  -- Insert the new group
  insert into groups (name, manager_id, location_id)
  values (group_name, group_manager_id, group_location_id)
  returning jsonb_build_object(
    'id', id,
    'name', name,
    'manager_id', manager_id,
    'location_id', location_id
  ) into new_group;

  -- Log the creation in audit_logs
  insert into audit_logs (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    user_id,
    user_email,
    user_role
  ) values (
    'groups',
    (new_group->>'id')::uuid,
    'create',
    null,
    new_group,
    audit_user_id,
    audit_user_email,
    audit_user_role
  );

  return new_group;
end;
$$;

-- Create the function for updating groups with audit logging
create or replace function update_group_with_audit(
  group_id uuid,
  group_data jsonb,
  audit_user_id uuid,
  audit_user_email text,
  audit_user_role text
) returns jsonb
language plpgsql
security definer
as $$
declare
  old_data jsonb;
  new_data jsonb;
begin
  -- Get the old data
  select jsonb_build_object(
    'id', id,
    'name', name,
    'manager_id', manager_id,
    'location_id', location_id
  )
  from groups
  where id = group_id
  into old_data;

  -- Update the group
  update groups
  set
    name = coalesce((group_data->>'name')::text, name),
    manager_id = coalesce((group_data->>'manager_id')::uuid, manager_id),
    location_id = coalesce((group_data->>'location_id')::uuid, location_id)
  where id = group_id
  returning jsonb_build_object(
    'id', id,
    'name', name,
    'manager_id', manager_id,
    'location_id', location_id
  ) into new_data;

  -- Log the update in audit_logs
  insert into audit_logs (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    user_id,
    user_email,
    user_role
  ) values (
    'groups',
    group_id,
    'update',
    old_data,
    new_data,
    audit_user_id,
    audit_user_email,
    audit_user_role
  );

  return new_data;
end;
$$;

-- Create the function for deleting groups with audit logging
create or replace function delete_group_with_audit(
  group_id uuid,
  audit_user_id uuid,
  audit_user_email text,
  audit_user_role text
) returns jsonb
language plpgsql
security definer
as $$
declare
  old_data jsonb;
begin
  -- Get the data before deletion
  select jsonb_build_object(
    'id', id,
    'name', name,
    'manager_id', manager_id,
    'location_id', location_id
  )
  from groups
  where id = group_id
  into old_data;

  -- Delete the group
  delete from groups where id = group_id;

  -- Log the deletion in audit_logs
  insert into audit_logs (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    user_id,
    user_email,
    user_role
  ) values (
    'groups',
    group_id,
    'delete',
    old_data,
    null,
    audit_user_id,
    audit_user_email,
    audit_user_role
  );

  return old_data;
end;
$$;
