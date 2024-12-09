-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for managers" ON surveys;
DROP POLICY IF EXISTS "Enable read access for all" ON surveys;
DROP POLICY IF EXISTS "Enable update for managers" ON surveys;
DROP POLICY IF EXISTS "Enable delete for managers" ON surveys;

-- Create new policies
CREATE POLICY "Enable insert for managers"
ON public.surveys
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = auth.uid()
        AND (
            u.role IN ('super_admin', 'admin', 'manager')
            OR EXISTS (
                SELECT 1
                FROM public.groups g
                WHERE g.id = surveys.group_id
                AND g.manager_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Enable read access for all"
ON public.surveys
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for managers"
ON public.surveys
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = auth.uid()
        AND (
            u.role IN ('super_admin', 'admin', 'manager')
            OR EXISTS (
                SELECT 1
                FROM public.groups g
                WHERE g.id = surveys.group_id
                AND g.manager_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Enable delete for managers"
ON public.surveys
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = auth.uid()
        AND (
            u.role IN ('super_admin', 'admin', 'manager')
            OR EXISTS (
                SELECT 1
                FROM public.groups g
                WHERE g.id = surveys.group_id
                AND g.manager_id = auth.uid()
            )
        )
    )
);

-- Enable RLS
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
