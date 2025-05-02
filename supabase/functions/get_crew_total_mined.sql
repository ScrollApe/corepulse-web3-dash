
CREATE OR REPLACE FUNCTION public.get_crew_total_mined(crew_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
AS $$
DECLARE
  total_mined_result FLOAT;
BEGIN
  SELECT COALESCE(SUM(u.total_mined), 0)
  INTO total_mined_result
  FROM users u
  JOIN crew_members cm ON u.id = cm.user_id
  WHERE cm.crew_id = $1;
  
  RETURN total_mined_result;
END;
$$;
