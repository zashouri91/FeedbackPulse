-- Create a function to handle location creation with proper auth context
create or replace function create_location(
  name text,
  managers uuid[]
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  location_data json;
  user_role text;
begin
  -- Get the user's role from the JWT
  user_role := auth.jwt() ->> 'role';
  
  -- Check if user has permission
  if user_role not in ('super_admin', 'admin') then
    raise exception 'Insufficient permissions to create location';
  end if;

  -- Insert the location and return the data
  insert into locations (name, managers)
  values (name, managers)
  returning to_json(locations.*) into location_data;

  return location_data;
end;
$$;
