-- Add user_id and schedule columns to report_templates
ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS schedule TEXT DEFAULT 'none';

-- Enable RLS on report_templates
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own templates" ON report_templates;
DROP POLICY IF EXISTS "Users can view public templates" ON report_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON report_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON report_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON report_templates;

-- Create RLS policies for report_templates
CREATE POLICY "Users can view their own templates"
  ON report_templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own templates"
  ON report_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON report_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON report_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Setup receipts storage bucket and RLS policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;

-- Create RLS policies for receipts bucket
CREATE POLICY "Users can upload their own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);