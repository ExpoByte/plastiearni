DROP POLICY "Users can update their own points" ON public.user_points;
ALTER TABLE public.user_points ADD CONSTRAINT non_negative_balance CHECK (balance >= 0);