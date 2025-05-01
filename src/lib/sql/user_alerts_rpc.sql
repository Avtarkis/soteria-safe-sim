
-- Create a function to get user alerts
CREATE OR REPLACE FUNCTION get_user_alerts(user_uuid UUID)
RETURNS SETOF user_alerts
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM user_alerts
  WHERE user_id = user_uuid
  ORDER BY created_at DESC;
$$;
