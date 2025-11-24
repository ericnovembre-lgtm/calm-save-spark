-- Create wallet contacts table for saving named addresses
CREATE TABLE wallet_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  notes TEXT,
  last_transaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE wallet_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own contacts"
  ON wallet_contacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON wallet_contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON wallet_contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON wallet_contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_wallet_contacts_user_id ON wallet_contacts(user_id);
CREATE INDEX idx_wallet_contacts_name ON wallet_contacts(user_id, name);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_wallet_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallet_contacts_updated_at
  BEFORE UPDATE ON wallet_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_contacts_updated_at();