-- Create plaid_items table to store Plaid Item information (one per bank connection)
CREATE TABLE IF NOT EXISTS public.plaid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  institution_logo TEXT,
  consent_expiration_time TIMESTAMP WITH TIME ZONE,
  update_type TEXT DEFAULT 'background',
  webhook_url TEXT,
  error_code TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.plaid_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plaid_items
CREATE POLICY "Users can view own plaid items"
  ON public.plaid_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plaid items"
  ON public.plaid_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plaid items"
  ON public.plaid_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plaid items"
  ON public.plaid_items FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_plaid_items_user_id ON public.plaid_items(user_id);
CREATE INDEX idx_plaid_items_item_id ON public.plaid_items(item_id);

-- Add item_id reference to connected_accounts (keep existing columns for backward compatibility)
ALTER TABLE public.connected_accounts 
ADD COLUMN IF NOT EXISTS plaid_item_table_id UUID REFERENCES public.plaid_items(id) ON DELETE CASCADE;

-- Create index on the foreign key
CREATE INDEX IF NOT EXISTS idx_connected_accounts_plaid_item ON public.connected_accounts(plaid_item_table_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plaid_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plaid_items_timestamp
  BEFORE UPDATE ON public.plaid_items
  FOR EACH ROW
  EXECUTE FUNCTION update_plaid_items_updated_at();