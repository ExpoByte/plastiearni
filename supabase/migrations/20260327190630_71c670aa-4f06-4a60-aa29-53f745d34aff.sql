
-- QR Transactions table for secure QR-based reward system
CREATE TABLE public.qr_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  weight_kg numeric NOT NULL CHECK (weight_kg > 0),
  points integer NOT NULL CHECK (points > 0),
  plastic_type text NOT NULL DEFAULT 'mixed',
  location text,
  status text NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired')),
  created_by uuid NOT NULL,
  used_by uuid,
  used_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE public.qr_transactions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage qr_transactions"
  ON public.qr_transactions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view QR transactions they've redeemed
CREATE POLICY "Users can view their redeemed qr_transactions"
  ON public.qr_transactions
  FOR SELECT
  TO authenticated
  USING (used_by = auth.uid());

-- Index for fast lookup by transaction_code
CREATE INDEX idx_qr_transactions_code ON public.qr_transactions (transaction_code);
CREATE INDEX idx_qr_transactions_status ON public.qr_transactions (status);

-- Audit trigger for QR transactions
CREATE OR REPLACE FUNCTION audit_qr_transaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (action, table_name, record_id, actor_id, actor_type, before_data, after_data)
  VALUES (
    TG_OP,
    'qr_transactions',
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    CASE WHEN public.has_role(auth.uid(), 'admin') THEN 'admin' ELSE 'user' END,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_qr_transaction
  AFTER INSERT OR UPDATE ON public.qr_transactions
  FOR EACH ROW EXECUTE FUNCTION audit_qr_transaction();
