-- Create dashboard_widget_preferences table for storing user widget customizations
CREATE TABLE public.dashboard_widget_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pinned_widgets TEXT[] DEFAULT '{}',
  hidden_widgets TEXT[] DEFAULT '{}',
  widget_order TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT dashboard_widget_preferences_user_id_key UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.dashboard_widget_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own widget preferences" 
ON public.dashboard_widget_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own widget preferences" 
ON public.dashboard_widget_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget preferences" 
ON public.dashboard_widget_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget preferences" 
ON public.dashboard_widget_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dashboard_widget_preferences_updated_at
BEFORE UPDATE ON public.dashboard_widget_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();