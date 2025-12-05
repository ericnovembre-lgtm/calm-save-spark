-- Ambient AI preferences table for persistence
CREATE TABLE public.ambient_ai_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_muted BOOLEAN DEFAULT false,
  voice_enabled BOOLEAN DEFAULT true,
  delivery_frequency TEXT DEFAULT 'normal', -- 'aggressive', 'normal', 'minimal', 'quiet'
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  quiet_hours_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Ambient AI feedback for learning preferences
CREATE TABLE public.ambient_ai_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  action TEXT NOT NULL, -- 'dismissed', 'acted', 'muted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ambient_ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambient_ai_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for preferences
CREATE POLICY "Users can view own preferences" ON public.ambient_ai_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.ambient_ai_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.ambient_ai_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for feedback
CREATE POLICY "Users can view own feedback" ON public.ambient_ai_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.ambient_ai_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_ambient_ai_feedback_user_type ON public.ambient_ai_feedback(user_id, insight_type);

-- Update timestamp trigger
CREATE TRIGGER update_ambient_ai_preferences_updated_at
  BEFORE UPDATE ON public.ambient_ai_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();