
-- Reward pool table to track platform funds
CREATE TABLE public.reward_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  balance numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert single row for the pool
INSERT INTO public.reward_pool (id, balance) VALUES (gen_random_uuid(), 0);

ALTER TABLE public.reward_pool ENABLE ROW LEVEL SECURITY;

-- Only admins can view/update the pool
CREATE POLICY "Admins can view reward pool"
  ON public.reward_pool FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reward pool"
  ON public.reward_pool FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fund transactions log (append-only ledger)
CREATE TABLE public.pool_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL,
  type text NOT NULL DEFAULT 'deposit',
  description text,
  admin_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pool_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view pool transactions"
  ON public.pool_transactions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pool transactions"
  ON public.pool_transactions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to add funds atomically
CREATE OR REPLACE FUNCTION public.fund_reward_pool(p_amount numeric, p_description text, p_admin_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_balance numeric;
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  UPDATE public.reward_pool
  SET balance = balance + p_amount, updated_at = now()
  RETURNING balance INTO v_new_balance;

  INSERT INTO public.pool_transactions (amount, type, description, admin_id)
  VALUES (p_amount, 'deposit', p_description, p_admin_id);

  INSERT INTO public.audit_logs (table_name, record_id, action, actor_id, actor_type, after_data)
  VALUES ('reward_pool', (SELECT id FROM public.reward_pool LIMIT 1), 'fund_deposit', p_admin_id, 'admin',
    jsonb_build_object('amount', p_amount, 'new_balance', v_new_balance, 'description', p_description));

  RETURN v_new_balance;
END;
$$;

-- Function to deduct from pool (called by edge functions during redemption)
CREATE OR REPLACE FUNCTION public.deduct_reward_pool(p_amount numeric, p_description text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_balance numeric;
BEGIN
  SELECT balance INTO v_current_balance FROM public.reward_pool LIMIT 1 FOR UPDATE;

  IF v_current_balance < p_amount THEN
    RETURN false;
  END IF;

  UPDATE public.reward_pool SET balance = balance - p_amount, updated_at = now();

  INSERT INTO public.pool_transactions (amount, type, description, admin_id)
  VALUES (p_amount, 'withdrawal', p_description, '00000000-0000-0000-0000-000000000000');

  RETURN true;
END;
$$;
