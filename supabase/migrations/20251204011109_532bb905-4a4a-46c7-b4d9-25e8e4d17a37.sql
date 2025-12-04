-- Batch processing analytics table
CREATE TABLE IF NOT EXISTS batch_processing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL,
  queue_depth INTEGER NOT NULL,
  batch_size INTEGER NOT NULL,
  transactions_processed INTEGER NOT NULL,
  anomalies_detected INTEGER DEFAULT 0,
  groq_latency_ms INTEGER NOT NULL,
  total_processing_ms INTEGER NOT NULL,
  tokens_used INTEGER,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_batch_analytics_created ON batch_processing_analytics(created_at DESC);
CREATE INDEX idx_batch_analytics_batch_id ON batch_processing_analytics(batch_id);

-- Enable RLS
ALTER TABLE batch_processing_analytics ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role full access on batch_processing_analytics"
  ON batch_processing_analytics
  FOR ALL
  USING (true)
  WITH CHECK (true);