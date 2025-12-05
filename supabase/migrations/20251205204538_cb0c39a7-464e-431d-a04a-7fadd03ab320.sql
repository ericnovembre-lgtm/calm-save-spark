-- Add voice command settings columns to mobile_preferences
ALTER TABLE mobile_preferences 
ADD COLUMN IF NOT EXISTS voice_auto_submit_delay INTEGER DEFAULT 1500,
ADD COLUMN IF NOT EXISTS voice_feedback_sound BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS voice_show_transcript BOOLEAN DEFAULT true;