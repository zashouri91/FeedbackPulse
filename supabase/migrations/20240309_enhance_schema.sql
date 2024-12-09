-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    parent_location_id UUID REFERENCES locations(id)
);

-- Create response_drivers table
CREATE TABLE IF NOT EXISTS response_drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES survey_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add response_drivers to survey_responses
ALTER TABLE survey_responses 
ADD COLUMN IF NOT EXISTS selected_drivers UUID[] DEFAULT '{}';

-- Add location management to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS primary_location_id UUID REFERENCES locations(id);

-- Create user_locations junction table for multiple locations
CREATE TABLE IF NOT EXISTS user_locations (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, location_id)
);

-- Add RLS policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all authenticated users" ON locations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON locations
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for users in same location" ON locations
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_locations ul
            WHERE ul.user_id = auth.uid()
            AND ul.location_id = id
        )
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_template_id ON survey_responses(template_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_location_id ON survey_responses(location_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_location_id ON user_locations(location_id);
