-- Create announcements table for news and updates
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'news',
  image_url TEXT,
  link_url TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active announcements
CREATE POLICY "Anyone can view active announcements"
  ON public.announcements FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Trigger for updated_at
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for announcements
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;

-- Insert some sample announcements
INSERT INTO public.announcements (title, content, category, is_pinned) VALUES
  ('Welcome to TakaPoints! 🎉', 'Start collecting plastic waste today and earn points redeemable for airtime, vouchers, or cash via M-Pesa.', 'announcement', true),
  ('New Collection Point in Westlands', 'We''ve opened a new EcoRecycle collection point in Westlands, Nairobi. Visit us Monday-Saturday 8am-6pm.', 'news', false),
  ('Double Points Weekend! 🌟', 'This weekend only - earn 200 points per kg of plastic collected! Valid Feb 8-9, 2026.', 'promotion', true);