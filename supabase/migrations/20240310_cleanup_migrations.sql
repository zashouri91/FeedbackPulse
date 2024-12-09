-- Consolidate all groups table changes
DROP TABLE IF EXISTS groups CASCADE;
CREATE TABLE public.groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  manager_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS groups_name_idx ON public.groups (name);
CREATE INDEX IF NOT EXISTS groups_location_id_idx ON public.groups (location_id);
CREATE INDEX IF NOT EXISTS groups_manager_id_idx ON public.groups (manager_id);

-- Consolidate all survey policies
DROP POLICY IF EXISTS "Enable read access for users" ON surveys;
DROP POLICY IF EXISTS "Enable write access for users" ON surveys;
DROP POLICY IF EXISTS "Enable delete for owners" ON surveys;

CREATE POLICY "Enable read access for users" ON surveys
  FOR SELECT TO authenticated
  USING (
    creator_id = auth.uid() OR
    assignee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND (
        u.role IN ('admin', 'manager') OR
        u.groups && ARRAY[group_id]
      )
    )
  );

CREATE POLICY "Enable write access for users" ON surveys
  FOR INSERT TO authenticated
  WITH CHECK (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND
      u.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Enable delete for owners" ON surveys
  FOR DELETE TO authenticated
  USING (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND
      u.role IN ('admin', 'manager')
    )
  );

-- Consolidate assignee functions
CREATE OR REPLACE FUNCTION get_assignable_users(p_location_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.role
  FROM users u
  WHERE u.location_id = p_location_id
  AND u.role != 'super_admin'
  ORDER BY u.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_assignable_groups(p_location_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  manager_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.name, g.manager_id
  FROM groups g
  WHERE g.location_id = p_location_id
  ORDER BY g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to groups table
DROP TRIGGER IF EXISTS set_groups_updated_at ON groups;
CREATE TRIGGER set_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Clean up any orphaned records
DELETE FROM surveys WHERE creator_id NOT IN (SELECT id FROM users);
DELETE FROM surveys WHERE assignee_id NOT IN (SELECT id FROM users);
DELETE FROM surveys WHERE group_id NOT IN (SELECT id FROM groups);
DELETE FROM surveys WHERE location_id NOT IN (SELECT id FROM locations);
