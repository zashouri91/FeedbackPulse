-- Enable real-time for survey_templates table
alter publication supabase_realtime add table survey_templates;

-- Add replication identifiers if not already present
ALTER TABLE survey_templates REPLICA IDENTITY FULL;
