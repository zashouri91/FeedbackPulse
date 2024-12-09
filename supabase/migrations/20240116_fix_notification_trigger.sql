-- Drop existing triggers
DROP TRIGGER IF EXISTS survey_notification_trigger ON public.surveys;
DROP TRIGGER IF EXISTS response_notification_trigger ON public.responses;

-- Update notification trigger function
CREATE OR REPLACE FUNCTION notification_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification based on the event
  INSERT INTO public.notifications (
    title,
    message,
    user_id
  )
  SELECT
    CASE TG_ARGV[0]
      WHEN 'survey' THEN 'New Survey Assigned'
      WHEN 'response' THEN 'New Survey Response'
      ELSE 'New Notification'
    END,
    CASE TG_ARGV[0]
      WHEN 'survey' THEN 'You have been assigned a new survey'
      WHEN 'response' THEN 'You have received a new survey response'
      ELSE 'You have a new notification'
    END,
    CASE TG_ARGV[0]
      WHEN 'survey' THEN NEW.assignee_id
      WHEN 'response' THEN (
        -- For responses, get the creator_id from the related survey
        SELECT s.creator_id 
        FROM public.surveys s 
        WHERE s.id = NEW.id
      )
      ELSE auth.uid()
    END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers
CREATE TRIGGER survey_notification_trigger
  AFTER INSERT ON public.surveys
  FOR EACH ROW 
  EXECUTE FUNCTION notification_trigger_function('survey');

CREATE TRIGGER response_notification_trigger
  AFTER INSERT ON public.responses
  FOR EACH ROW 
  EXECUTE FUNCTION notification_trigger_function('response');

-- Test survey creation
DO $$
DECLARE
    v_user_id uuid;
    v_group_id uuid;
    v_location_id uuid;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    -- Get first group
    SELECT id INTO v_group_id FROM public.groups LIMIT 1;
    
    -- Get first location
    SELECT id INTO v_location_id FROM public.locations LIMIT 1;
    
    -- Try insert
    INSERT INTO public.surveys (
        assignee_id,
        group_id,
        location_id,
        creator_id
    ) VALUES (
        v_user_id,
        v_group_id,
        v_location_id,
        v_user_id
    );
    
    RAISE NOTICE 'Survey created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating survey: %', SQLERRM;
END $$;
