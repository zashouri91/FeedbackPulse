-- Drop old templates table if it exists
DROP TABLE IF EXISTS templates CASCADE;

-- Ensure survey_templates has all required columns and constraints
ALTER TABLE survey_templates
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  ALTER COLUMN rating_type SET DEFAULT 'numeric',
  ALTER COLUMN scale_min SET DEFAULT 1,
  ALTER COLUMN scale_max SET DEFAULT 5;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_survey_templates_created_by ON survey_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_survey_templates_rating_type ON survey_templates(rating_type);
CREATE INDEX IF NOT EXISTS idx_survey_templates_created_at ON survey_templates(created_at);

-- Add foreign key constraint to survey_responses
ALTER TABLE survey_responses
  DROP CONSTRAINT IF EXISTS survey_responses_template_id_fkey,
  ADD CONSTRAINT survey_responses_template_id_fkey 
  FOREIGN KEY (template_id) 
  REFERENCES survey_templates(id) 
  ON DELETE CASCADE;

-- Add check constraints for scale values
ALTER TABLE survey_templates
  ADD CONSTRAINT check_scale_values 
  CHECK (scale_min < scale_max AND scale_min >= 0 AND scale_max <= 10);

-- Create function to validate assigned entities
CREATE OR REPLACE FUNCTION validate_survey_template_assignments()
RETURNS TRIGGER AS $$
DECLARE
  invalid_user UUID;
  invalid_group UUID;
  invalid_location UUID;
BEGIN
  -- Check assigned users
  SELECT unnest(NEW.assigned_users) INTO invalid_user
  FROM unnest(NEW.assigned_users) AS user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  )
  LIMIT 1;

  IF invalid_user IS NOT NULL THEN
    RAISE EXCEPTION 'Invalid user ID in assigned_users: %', invalid_user;
  END IF;

  -- Check assigned groups
  SELECT unnest(NEW.assigned_groups) INTO invalid_group
  FROM unnest(NEW.assigned_groups) AS group_id
  WHERE NOT EXISTS (
    SELECT 1 FROM groups WHERE id = group_id
  )
  LIMIT 1;

  IF invalid_group IS NOT NULL THEN
    RAISE EXCEPTION 'Invalid group ID in assigned_groups: %', invalid_group;
  END IF;

  -- Check assigned locations
  SELECT unnest(NEW.assigned_locations) INTO invalid_location
  FROM unnest(NEW.assigned_locations) AS location_id
  WHERE NOT EXISTS (
    SELECT 1 FROM locations WHERE id = location_id
  )
  LIMIT 1;

  IF invalid_location IS NOT NULL THEN
    RAISE EXCEPTION 'Invalid location ID in assigned_locations: %', invalid_location;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assignment validation
DROP TRIGGER IF EXISTS validate_survey_template_assignments_trigger ON survey_templates;
CREATE TRIGGER validate_survey_template_assignments_trigger
  BEFORE INSERT OR UPDATE ON survey_templates
  FOR EACH ROW
  EXECUTE FUNCTION validate_survey_template_assignments();

-- Update existing records to ensure consistency
UPDATE survey_templates
SET 
  updated_at = TIMEZONE('utc', NOW()),
  rating_type = COALESCE(rating_type, 'numeric'),
  scale_min = COALESCE(scale_min, 1),
  scale_max = COALESCE(scale_max, 5),
  thank_you_message = COALESCE(thank_you_message, 'Thank you for your feedback!'),
  follow_up_message = COALESCE(follow_up_message, 'Is there anything else you would like to share?'),
  assigned_users = COALESCE(assigned_users, '{}'),
  assigned_groups = COALESCE(assigned_groups, '{}'),
  assigned_locations = COALESCE(assigned_locations, '{}');

-- Ensure RLS policies are up to date
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON survey_templates;
CREATE POLICY "Enable read access for authenticated users" ON survey_templates
  FOR SELECT TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() = ANY(assigned_users) OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND (
        u.role IN ('admin', 'manager') OR
        u.groups && assigned_groups
      )
    )
  );
