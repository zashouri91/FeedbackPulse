-- Drop existing survey policies
DROP POLICY IF EXISTS "Surveys are viewable by creator, assignee, and managers" ON public.surveys;
DROP POLICY IF EXISTS "Surveys can be created by super_admin, admin, and managers" ON public.surveys;
DROP POLICY IF EXISTS "Surveys can be updated by creator and managers" ON public.surveys;
DROP POLICY IF EXISTS "Surveys can be deleted by creator and managers" ON public.surveys;

-- Recreate survey policies with proper role checks
CREATE POLICY "Surveys are viewable by creator, assignee, and managers"
ON public.surveys FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  OR creator_id = auth.uid()
  OR assignee_id = auth.uid()
  OR (
    auth.jwt() ->> 'role' = 'manager'
    AND EXISTS (
      SELECT 1
      FROM public.groups g
      WHERE g.id = group_id
      AND g.manager_id = auth.uid()
    )
  )
);

CREATE POLICY "Surveys can be created by super_admin, admin, and managers"
ON public.surveys FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' in ('super_admin', 'admin')
  OR (
    auth.jwt() ->> 'role' = 'manager'
    AND EXISTS (
      SELECT 1
      FROM public.groups g
      WHERE g.id = group_id
      AND g.manager_id = auth.uid()
    )
  )
);

CREATE POLICY "Surveys can be updated by creator and managers"
ON public.surveys FOR UPDATE
TO authenticated
USING (
  creator_id = auth.uid()
  OR (
    auth.jwt() ->> 'role' = 'manager'
    AND EXISTS (
      SELECT 1
      FROM public.groups g
      WHERE g.id = group_id
      AND g.manager_id = auth.uid()
    )
  )
)
WITH CHECK (
  creator_id = auth.uid()
  OR (
    auth.jwt() ->> 'role' = 'manager'
    AND EXISTS (
      SELECT 1
      FROM public.groups g
      WHERE g.id = group_id
      AND g.manager_id = auth.uid()
    )
  )
);

CREATE POLICY "Surveys can be deleted by creator and managers"
ON public.surveys FOR DELETE
TO authenticated
USING (
  creator_id = auth.uid()
  OR (
    auth.jwt() ->> 'role' = 'manager'
    AND EXISTS (
      SELECT 1
      FROM public.groups g
      WHERE g.id = group_id
      AND g.manager_id = auth.uid()
    )
  )
);
