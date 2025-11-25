-- Create wallet_backups table for encrypted seed phrase storage
CREATE TABLE IF NOT EXISTS wallet_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  encrypted_seed_phrase TEXT NOT NULL,
  encryption_hint TEXT,
  backup_type TEXT NOT NULL DEFAULT 'full' CHECK (backup_type IN ('full', 'partial')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ,
  UNIQUE(wallet_id)
);

-- Enable RLS
ALTER TABLE wallet_backups ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own backups
CREATE POLICY "Users can view their own wallet backups"
  ON wallet_backups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet backups"
  ON wallet_backups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet backups"
  ON wallet_backups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallet backups"
  ON wallet_backups FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_wallet_backups_user_id ON wallet_backups(user_id);
CREATE INDEX idx_wallet_backups_wallet_id ON wallet_backups(wallet_id);

-- Audit log for backup access
CREATE TABLE IF NOT EXISTS wallet_backup_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES wallet_backups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'accessed', 'recovered', 'deleted')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE wallet_backup_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backup audit logs"
  ON wallet_backup_audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for audit log
CREATE INDEX idx_wallet_backup_audit_log_backup_id ON wallet_backup_audit_log(backup_id);
CREATE INDEX idx_wallet_backup_audit_log_user_id ON wallet_backup_audit_log(user_id);