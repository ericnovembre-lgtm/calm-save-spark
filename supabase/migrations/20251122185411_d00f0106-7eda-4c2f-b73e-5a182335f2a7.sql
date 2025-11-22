-- Add persona and draft data columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_persona jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_draft_data jsonb;

-- Create onboarding conversations table for message history
CREATE TABLE IF NOT EXISTS onboarding_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  persona jsonb,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE onboarding_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own conversations"
  ON onboarding_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON onboarding_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON onboarding_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_onboarding_conversations_user_id 
  ON onboarding_conversations(user_id);

-- Create index for persona queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_persona 
  ON profiles USING gin (onboarding_persona);