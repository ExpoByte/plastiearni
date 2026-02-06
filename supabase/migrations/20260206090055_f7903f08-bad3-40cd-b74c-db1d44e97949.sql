-- Create collections table to track plastic collections
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weight_kg DECIMAL(10, 2) NOT NULL,
  points_earned INTEGER NOT NULL,
  location TEXT,
  plastic_type TEXT NOT NULL DEFAULT 'mixed',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to award points when collection is verified
CREATE OR REPLACE FUNCTION public.award_collection_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a collection is inserted, add points to user_points
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_points
    SET 
      balance = balance + NEW.points_earned,
      total_earned = total_earned + NEW.points_earned,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-award points on new collection
CREATE TRIGGER award_points_on_collection
  AFTER INSERT ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.award_collection_points();