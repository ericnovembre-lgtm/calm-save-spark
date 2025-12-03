-- Create transaction alert queue table
CREATE TABLE IF NOT EXISTS public.transaction_alert_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  transaction_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Create indexes for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_transaction_alert_queue_status 
  ON public.transaction_alert_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_alert_queue_user 
  ON public.transaction_alert_queue(user_id);

-- Enable RLS
ALTER TABLE public.transaction_alert_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own queue items
CREATE POLICY "Users can view own queue items" 
  ON public.transaction_alert_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Create trigger function to queue new transactions for Groq analysis
CREATE OR REPLACE FUNCTION public.trigger_transaction_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only process expense transactions (negative amounts)
  IF NEW.amount < 0 THEN
    INSERT INTO public.transaction_alert_queue (
      transaction_id, 
      user_id, 
      transaction_data
    )
    VALUES (
      NEW.id,
      NEW.user_id,
      jsonb_build_object(
        'id', NEW.id,
        'merchant', NEW.merchant,
        'amount', NEW.amount,
        'category', NEW.category,
        'transaction_date', NEW.transaction_date
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS on_new_transaction_alert ON public.transactions;
CREATE TRIGGER on_new_transaction_alert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_transaction_alert();