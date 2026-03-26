
-- 1. Create collection_adjustments table (append-only corrections)
CREATE TABLE public.collection_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id),
  original_kg NUMERIC NOT NULL,
  original_points INTEGER NOT NULL,
  adjusted_kg NUMERIC NOT NULL,
  adjusted_points INTEGER NOT NULL,
  delta_kg NUMERIC GENERATED ALWAYS AS (adjusted_kg - original_kg) STORED,
  delta_points INTEGER GENERATED ALWAYS AS (adjusted_points - original_points) STORED,
  reason TEXT NOT NULL,
  admin_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create audit_logs table (read-only, append-only)
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID,
  actor_type TEXT NOT NULL DEFAULT 'system',
  before_data JSONB,
  after_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create fraud_flags table
CREATE TABLE public.fraud_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  description TEXT NOT NULL,
  related_user_id UUID,
  related_collection_id UUID REFERENCES public.collections(id),
  related_adjustment_id UUID REFERENCES public.collection_adjustments(id),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable RLS on all new tables
ALTER TABLE public.collection_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for collection_adjustments
CREATE POLICY "Admins can manage adjustments" ON public.collection_adjustments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view adjustments on their collections" ON public.collection_adjustments
  FOR SELECT USING (
    collection_id IN (SELECT id FROM public.collections WHERE user_id = auth.uid())
  );

-- 6. RLS policies for audit_logs (read-only for admins)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view audit logs for their records" ON public.audit_logs
  FOR SELECT USING (
    (table_name = 'collections' AND record_id IN (SELECT id FROM public.collections WHERE user_id = auth.uid()))
    OR (table_name = 'collection_adjustments' AND record_id IN (
      SELECT ca.id FROM public.collection_adjustments ca
      JOIN public.collections c ON ca.collection_id = c.id
      WHERE c.user_id = auth.uid()
    ))
  );

-- 7. RLS policies for fraud_flags (admin only)
CREATE POLICY "Admins can manage fraud flags" ON public.fraud_flags
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 8. Remove UPDATE policy on collections (make immutable)
DROP POLICY IF EXISTS "Users can update their own collections" ON public.collections;

-- 9. Audit trigger function for collections
CREATE OR REPLACE FUNCTION public.audit_collection_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (table_name, record_id, action, actor_id, actor_type, after_data)
  VALUES ('collections', NEW.id, 'created', NEW.user_id, 'user', row_to_json(NEW)::jsonb);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_collection_insert
  AFTER INSERT ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.audit_collection_insert();

-- 10. Audit trigger for adjustments
CREATE OR REPLACE FUNCTION public.audit_adjustment_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (table_name, record_id, action, actor_id, actor_type, after_data, metadata)
  VALUES ('collection_adjustments', NEW.id, 'adjustment_created', NEW.admin_id, 'admin',
    row_to_json(NEW)::jsonb,
    jsonb_build_object('collection_id', NEW.collection_id, 'reason', NEW.reason));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_adjustment_insert
  AFTER INSERT ON public.collection_adjustments
  FOR EACH ROW EXECUTE FUNCTION public.audit_adjustment_insert();

-- 11. Audit trigger for adjustment status changes
CREATE OR REPLACE FUNCTION public.audit_adjustment_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (table_name, record_id, action, actor_id, actor_type, before_data, after_data, metadata)
  VALUES ('collection_adjustments', NEW.id, 
    CASE WHEN NEW.status = 'approved' THEN 'adjustment_approved' 
         WHEN NEW.status = 'rejected' THEN 'adjustment_rejected'
         ELSE 'adjustment_updated' END,
    NEW.reviewed_by, 'admin',
    row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb,
    jsonb_build_object('review_notes', NEW.review_notes));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_adjustment_update
  AFTER UPDATE ON public.collection_adjustments
  FOR EACH ROW EXECUTE FUNCTION public.audit_adjustment_update();

-- 12. Fraud detection function for high kg entries
CREATE OR REPLACE FUNCTION public.check_collection_fraud()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Flag unusually high kg entries (> 50kg)
  IF NEW.weight_kg > 50 THEN
    INSERT INTO public.fraud_flags (flag_type, severity, description, related_user_id, related_collection_id)
    VALUES ('high_weight', 'warning', 
      format('Unusually high collection: %s kg', NEW.weight_kg),
      NEW.user_id, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_collection_fraud
  AFTER INSERT ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.check_collection_fraud();

-- 13. Fraud detection for frequent adjustments
CREATE OR REPLACE FUNCTION public.check_adjustment_fraud()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_adj_count INTEGER;
  v_collection_adj_count INTEGER;
BEGIN
  -- Check if same admin has made > 10 adjustments in last 24 hours
  SELECT COUNT(*) INTO v_admin_adj_count
  FROM public.collection_adjustments
  WHERE admin_id = NEW.admin_id AND created_at > now() - interval '24 hours';
  
  IF v_admin_adj_count > 10 THEN
    INSERT INTO public.fraud_flags (flag_type, severity, description, related_user_id, related_adjustment_id)
    VALUES ('frequent_admin_adjustments', 'critical',
      format('Admin has made %s adjustments in last 24h', v_admin_adj_count),
      NEW.admin_id, NEW.id);
  END IF;

  -- Check if same collection has been adjusted more than 3 times
  SELECT COUNT(*) INTO v_collection_adj_count
  FROM public.collection_adjustments
  WHERE collection_id = NEW.collection_id;
  
  IF v_collection_adj_count > 3 THEN
    INSERT INTO public.fraud_flags (flag_type, severity, description, related_collection_id, related_adjustment_id)
    VALUES ('repeated_corrections', 'warning',
      format('Collection has been adjusted %s times', v_collection_adj_count),
      NEW.collection_id, NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_adjustment_fraud
  AFTER INSERT ON public.collection_adjustments
  FOR EACH ROW EXECUTE FUNCTION public.check_adjustment_fraud();

-- 14. Function to apply approved adjustment points
CREATE OR REPLACE FUNCTION public.apply_adjustment_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_delta INTEGER;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    SELECT user_id INTO v_user_id FROM public.collections WHERE id = NEW.collection_id;
    v_delta := NEW.adjusted_points - NEW.original_points;
    
    UPDATE public.user_points
    SET balance = balance + v_delta,
        total_earned = total_earned + v_delta,
        updated_at = now()
    WHERE user_id = v_user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_apply_adjustment_points
  AFTER UPDATE ON public.collection_adjustments
  FOR EACH ROW EXECUTE FUNCTION public.apply_adjustment_points();

-- 15. Admin RPC to get collections with adjustments (dual-value model)
CREATE OR REPLACE FUNCTION public.get_collections_with_adjustments(p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  original_kg NUMERIC,
  original_points INTEGER,
  adjusted_kg NUMERIC,
  adjusted_points INTEGER,
  final_kg NUMERIC,
  final_points INTEGER,
  plastic_type TEXT,
  location TEXT,
  status TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ,
  has_adjustment BOOLEAN,
  adjustment_status TEXT,
  adjustment_reason TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    c.id,
    c.user_id,
    c.weight_kg AS original_kg,
    c.points_earned AS original_points,
    ca.adjusted_kg,
    ca.adjusted_points,
    COALESCE(CASE WHEN ca.status = 'approved' THEN ca.adjusted_kg END, c.weight_kg) AS final_kg,
    COALESCE(CASE WHEN ca.status = 'approved' THEN ca.adjusted_points END, c.points_earned) AS final_points,
    c.plastic_type,
    c.location,
    c.status,
    c.photo_url,
    c.created_at,
    (ca.id IS NOT NULL) AS has_adjustment,
    ca.status AS adjustment_status,
    ca.reason AS adjustment_reason
  FROM public.collections c
  LEFT JOIN LATERAL (
    SELECT * FROM public.collection_adjustments adj
    WHERE adj.collection_id = c.id
    ORDER BY adj.created_at DESC
    LIMIT 1
  ) ca ON true
  ORDER BY c.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;
