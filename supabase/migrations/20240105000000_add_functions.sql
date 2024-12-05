-- Helper function to calculate NPS for a survey
create or replace function calculate_survey_nps(survey_uuid uuid)
returns integer as $$
declare
  total_responses integer;
  promoters integer;
  detractors integer;
begin
  select count(*) into total_responses
  from responses
  where survey_id = survey_uuid;

  if total_responses = 0 then
    return 0;
  end if;

  select count(*) into promoters
  from responses
  where survey_id = survey_uuid and rating >= 4;

  select count(*) into detractors
  from responses
  where survey_id = survey_uuid and rating <= 2;

  return (((promoters::float / total_responses) - (detractors::float / total_responses)) * 100)::integer;
end;
$$ language plpgsql security definer;

-- Function to get survey statistics
create or replace function get_survey_statistics(survey_uuid uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_responses', count(*),
    'average_rating', avg(rating),
    'nps_score', calculate_survey_nps(survey_uuid),
    'rating_distribution', (
      select json_agg(json_build_object(
        'rating', rating,
        'count', count(*)
      ))
      from (
        select rating, count(*)
        from responses
        where survey_id = survey_uuid
        group by rating
        order by rating
      ) t
    )
  ) into result
  from responses
  where survey_id = survey_uuid;

  return result;
end;
$$ language plpgsql security definer;