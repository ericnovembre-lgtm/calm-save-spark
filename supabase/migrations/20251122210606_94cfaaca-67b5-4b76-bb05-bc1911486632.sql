-- Add new columns to user_preferences for enhanced settings
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#d6c8a2',
ADD COLUMN IF NOT EXISTS natural_language_rules JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS spending_persona JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_security_check TIMESTAMPTZ DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_security ON user_preferences(user_id, security_score);
