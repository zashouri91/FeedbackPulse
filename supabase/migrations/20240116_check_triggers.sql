-- Check triggers on surveys table
SELECT 
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'surveys'
AND trigger_schema = 'public';
