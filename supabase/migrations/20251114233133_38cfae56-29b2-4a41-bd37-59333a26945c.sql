-- Add milestones_reached column to profiles table
-- Stores user's achieved savings milestones with timestamps

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS milestones_reached JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.milestones_reached IS 'JSON object storing reached milestones: { "1000": "2024-01-15T10:30:00Z", "10000": "2024-06-20T15:45:00Z" }';