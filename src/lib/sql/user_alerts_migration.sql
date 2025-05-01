
-- SQL migration for user_alerts table
-- Note: This is for reference only and should be run manually in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.user_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('security', 'health', 'environmental', 'travel', 'family', 'cyber')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action_text TEXT,
  action_link TEXT,
  icon TEXT
);

-- RLS policies
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts" 
  ON public.user_alerts 
  FOR SELECT 
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own alerts" 
  ON public.user_alerts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow admins to insert alerts for any user
CREATE POLICY "Admins can insert alerts for any user"
  ON public.user_alerts
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users 
      WHERE email LIKE '%@soteria.com'
    )
  );

-- Function to update timestamp on update
CREATE OR REPLACE FUNCTION public.update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamp
CREATE TRIGGER update_user_alerts_updated_at
BEFORE UPDATE ON public.user_alerts
FOR EACH ROW
EXECUTE PROCEDURE public.update_modified_column();

-- Index for faster queries
CREATE INDEX idx_user_alerts_user_id ON public.user_alerts (user_id);

-- Set up realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_alerts;
