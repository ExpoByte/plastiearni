
CREATE OR REPLACE FUNCTION public.award_collection_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_calculated_points INTEGER;
  v_points_per_kg INTEGER := 100;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'verified' THEN
    v_calculated_points := ROUND(NEW.weight_kg * v_points_per_kg);
    NEW.points_earned := v_calculated_points;
    
    UPDATE public.user_points
    SET 
      balance = balance + v_calculated_points,
      total_earned = total_earned + v_calculated_points,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;
