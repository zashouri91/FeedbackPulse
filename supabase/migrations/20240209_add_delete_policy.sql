-- Enable RLS
ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;

-- Add delete policy for template owners
CREATE POLICY "Enable delete for template owners" ON survey_templates
    FOR DELETE TO authenticated
    USING (auth.uid() = created_by);

-- Grant delete permission to authenticated users
GRANT DELETE ON survey_templates TO authenticated;
