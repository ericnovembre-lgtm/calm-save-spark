import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEP_LABELS = {
  welcome: "Welcome",
  account: "Account Setup",
  goal: "First Goal",
  automation: "Automation",
  complete: "Complete"
};

export const OnboardingProgress = () => {
  const { data: profile } = useQuery({
    queryKey: ['profile-onboarding-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_progress, onboarding_completed')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (!profile || !profile.onboarding_progress) return null;

  const progress = profile.onboarding_progress as Record<string, string | null>;
  const steps = Object.entries(STEP_LABELS);
  
  return (
    <Card className="border-border shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-lg font-display">Onboarding Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map(([key, label]) => {
            const status = progress[key];
            
            return (
              <div key={key} className="flex items-center gap-3">
                {status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                ) : status === 'skipped' ? (
                  <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  {status && (
                    <p className="text-xs text-muted-foreground capitalize">{status}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};