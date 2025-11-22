-- Create market_news_cache table for Phase 2
CREATE TABLE IF NOT EXISTS public.market_news_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  headline text NOT NULL,
  source text,
  published_at timestamptz,
  url text,
  sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  relevance_score numeric,
  cached_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour'),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_news_symbol ON public.market_news_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_market_news_expires ON public.market_news_cache(expires_at);

-- Enable RLS
ALTER TABLE public.market_news_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read news
CREATE POLICY "Users can read market news"
  ON public.market_news_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Clean up expired news cache
CREATE OR REPLACE FUNCTION public.cleanup_expired_news_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.market_news_cache 
  WHERE expires_at < now();
END;
$$;