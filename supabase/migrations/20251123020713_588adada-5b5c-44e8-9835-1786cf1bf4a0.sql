-- Create recurring detection queue table
CREATE TABLE IF NOT EXISTS public.recurring_detection_queue (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function to trigger recurring detection
CREATE OR REPLACE FUNCTION public.trigger_recurring_detection()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.recurring_detection_queue (user_id, triggered_at)
  VALUES (NEW.user_id, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET triggered_at = NOW(), processed_at = NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to queue recurring detection after transaction insert
CREATE TRIGGER after_transaction_insert_detect_recurring
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recurring_detection();

-- Enable RLS on queue table
ALTER TABLE public.recurring_detection_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own queue entries
CREATE POLICY "Users can view own queue entries"
ON public.recurring_detection_queue
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: System can manage all queue entries
CREATE POLICY "System can manage queue entries"
ON public.recurring_detection_queue
FOR ALL
TO service_role
USING (true);