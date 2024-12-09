CREATE OR REPLACE FUNCTION get_survey_analytics(
  date_range jsonb DEFAULT NULL,
  users text[] DEFAULT NULL,
  groups text[] DEFAULT NULL,
  locations text[] DEFAULT NULL,
  rating_range jsonb DEFAULT NULL,
  drivers text[] DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH filtered_responses AS (
    SELECT *
    FROM survey_responses sr
    WHERE (date_range IS NULL OR (
      sr.created_at >= (date_range->>'start')::timestamp AND
      sr.created_at <= (date_range->>'end')::timestamp
    ))
    AND (users IS NULL OR sr.user_id = ANY(users))
    AND (groups IS NULL OR sr.group_id = ANY(groups))
    AND (locations IS NULL OR sr.location_id = ANY(locations))
    AND (rating_range IS NULL OR (
      sr.rating >= (rating_range->>'min')::int AND
      sr.rating <= (rating_range->>'max')::int
    ))
    AND (drivers IS NULL OR sr.selected_drivers && drivers)
  )
  SELECT jsonb_build_object(
    'averageRating', (SELECT COALESCE(AVG(rating), 0) FROM filtered_responses),
    'responseCount', (SELECT COUNT(*) FROM filtered_responses),
    'ratingDistribution', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'rating', rating,
          'count', count
        )
      )
      FROM (
        SELECT rating, COUNT(*) as count
        FROM filtered_responses
        GROUP BY rating
        ORDER BY rating
      ) rd
    ),
    'topDrivers', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', driver,
          'count', count
        )
      )
      FROM (
        SELECT unnest(selected_drivers) as driver, COUNT(*) as count
        FROM filtered_responses
        GROUP BY driver
        ORDER BY count DESC
        LIMIT 5
      ) td
    )
  ) INTO result;

  RETURN result;
END;
$$;
