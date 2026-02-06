-- Drop the insecure view
DROP VIEW IF EXISTS public.admin_stats;

-- Create a security definer function to get admin stats instead
-- This is safer as it explicitly checks admin role
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_points_balance BIGINT,
  total_points_earned BIGINT,
  total_collections BIGINT,
  total_kg_collected NUMERIC,
  total_redemptions BIGINT,
  successful_redemptions BIGINT,
  active_announcements BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM public.profiles),
    (SELECT COALESCE(SUM(balance), 0)::BIGINT FROM public.user_points),
    (SELECT COALESCE(SUM(total_earned), 0)::BIGINT FROM public.user_points),
    (SELECT COUNT(*)::BIGINT FROM public.collections),
    (SELECT COALESCE(SUM(weight_kg), 0)::NUMERIC FROM public.collections),
    (SELECT COUNT(*)::BIGINT FROM public.redemptions),
    (SELECT COUNT(*)::BIGINT FROM public.redemptions WHERE status = 'success'),
    (SELECT COUNT(*)::BIGINT FROM public.announcements WHERE is_active = true);
END;
$$;