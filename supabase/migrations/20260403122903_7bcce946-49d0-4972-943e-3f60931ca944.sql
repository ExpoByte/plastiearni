
CREATE TABLE public.stk_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  checkout_request_id TEXT,
  mpesa_receipt TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stk_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view stk deposits"
  ON public.stk_deposits FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert stk deposits"
  ON public.stk_deposits FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_stk_deposits_updated_at
  BEFORE UPDATE ON public.stk_deposits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
