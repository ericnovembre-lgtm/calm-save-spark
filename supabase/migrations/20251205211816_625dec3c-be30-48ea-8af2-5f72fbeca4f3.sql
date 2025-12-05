-- Create voice command history table
CREATE TABLE public.voice_command_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_text TEXT NOT NULL,
  command_type TEXT NOT NULL,
  result_action TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  frequency INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_command_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own command history"
ON public.voice_command_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commands"
ON public.voice_command_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commands"
ON public.voice_command_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commands"
ON public.voice_command_history
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_voice_command_history_user_id ON public.voice_command_history(user_id);
CREATE INDEX idx_voice_command_history_frequency ON public.voice_command_history(user_id, frequency DESC);