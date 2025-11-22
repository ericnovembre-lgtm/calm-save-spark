-- Create transaction search history table
CREATE TABLE IF NOT EXISTS public.transaction_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  parsed_filters JSONB NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for user queries
CREATE INDEX IF NOT EXISTS idx_search_history_user_date 
  ON public.transaction_search_history(user_id, searched_at DESC);

-- Enable RLS
ALTER TABLE public.transaction_search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own search history"
  ON public.transaction_search_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
  ON public.transaction_search_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
  ON public.transaction_search_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.transaction_search_history IS 'Stores natural language search queries and their parsed filters for transaction searches';