-- Migration: Add account nicknames and enable realtime

-- Add nickname column to connected_accounts
ALTER TABLE connected_accounts 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_connected_accounts_nickname 
ON connected_accounts(nickname) 
WHERE nickname IS NOT NULL;

-- Enable realtime for connected_accounts
ALTER PUBLICATION supabase_realtime ADD TABLE connected_accounts;

-- Set replica identity to capture all changes
ALTER TABLE connected_accounts REPLICA IDENTITY FULL;