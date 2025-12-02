-- Create table for shared scenario links
CREATE TABLE shared_scenario_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  scenario_name TEXT NOT NULL,
  scenario_data JSONB NOT NULL,
  preview_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on share_token for fast lookups
CREATE INDEX idx_shared_scenario_links_share_token ON shared_scenario_links(share_token);
CREATE INDEX idx_shared_scenario_links_user_id ON shared_scenario_links(user_id);

-- Enable RLS
ALTER TABLE shared_scenario_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own shared links
CREATE POLICY "Users can view own shared links"
  ON shared_scenario_links
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create shared links
CREATE POLICY "Users can create shared links"
  ON shared_scenario_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own shared links
CREATE POLICY "Users can delete own shared links"
  ON shared_scenario_links
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Anyone can view public shared links via token
CREATE POLICY "Public can view shared scenarios"
  ON shared_scenario_links
  FOR SELECT
  USING (is_public = true);

-- Create storage bucket for scenario preview images
INSERT INTO storage.buckets (id, name, public)
VALUES ('scenario-previews', 'scenario-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to scenario previews
CREATE POLICY "Public can view scenario previews"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'scenario-previews');

-- Allow authenticated users to upload their own previews
CREATE POLICY "Users can upload scenario previews"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'scenario-previews' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own previews
CREATE POLICY "Users can delete own scenario previews"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'scenario-previews' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );