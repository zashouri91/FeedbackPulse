-- Create notification trigger function
create or replace function notification_trigger_function()
returns trigger as $$
begin
  -- Insert notification based on the event
  insert into public.notifications (
    title,
    message,
    user_id
  )
  select
    case TG_ARGV[0]
      when 'survey' then 'New Survey Assigned'
      when 'response' then 'New Survey Response'
      else 'New Notification'
    end,
    case TG_ARGV[0]
      when 'survey' then 'You have been assigned a new survey'
      when 'response' then 'You have received a new survey response'
      else 'You have a new notification'
    end,
    case TG_ARGV[0]
      when 'survey' then NEW.assignee_id
      when 'response' then (select creator_id from surveys where id = NEW.survey_id)
      else auth.uid()
    end;

  return NEW;
end;
$$ language plpgsql security definer;

-- Create notification triggers
create trigger survey_notification_trigger
  after insert on public.surveys
  for each row execute function notification_trigger_function('survey');

create trigger response_notification_trigger
  after insert on public.responses
  for each row execute function notification_trigger_function('response');