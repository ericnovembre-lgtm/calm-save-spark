import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Brain, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function CoolingOffScreen() {
  const [reflection, setReflection] = useState("");
  const queryClient = useQueryClient();

  const { data: activeSession, isLoading } = useQuery({
    queryKey: ['cooling-off-session'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('cooling_off_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('early_exit_requested', null)
        .gt('end_time', new Date().toISOString())
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const saveReflectionMutation = useMutation({
    mutationFn: async (notes: string) => {
      if (!activeSession) throw new Error('No active session');

      const { error } = await supabase
        .from('cooling_off_sessions')
        .update({ reflection_notes: notes })
        .eq('id', activeSession.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Reflection saved');
      queryClient.invalidateQueries({ queryKey: ['cooling-off-session'] });
    },
  });

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!activeSession?.end_time) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(activeSession.end_time);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Cooling-off period complete!');
        queryClient.invalidateQueries({ queryKey: ['cooling-off-session'] });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSession, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!activeSession) {
    return null;
  }

  const isComplete = new Date(activeSession.end_time) <= new Date();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {isComplete ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <Clock className="w-8 h-8 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isComplete ? 'Cooling-Off Period Complete' : 'Cooling-Off Period Active'}
          </h1>
          <p className="text-muted-foreground">
            {isComplete 
              ? 'You can now proceed with your investment decision'
              : 'Take this time to reflect on your investment decision rationally'
            }
          </p>
        </div>

        {!isComplete && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Time Remaining</p>
              <p className="text-4xl font-bold text-foreground mb-1">{timeRemaining}</p>
              <p className="text-xs text-muted-foreground">
                Triggered by: <span className="font-semibold">{activeSession.triggered_by}</span>
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Reflection Questions</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Why did I want to make this trade in the first place?</li>
                <li>• What emotions am I feeling right now?</li>
                <li>• Have I done thorough research and analysis?</li>
                <li>• What would I tell a friend in this situation?</li>
                <li>• How will I feel about this decision tomorrow? Next week?</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Your Reflections</label>
          <Textarea
            value={reflection || activeSession.reflection_notes || ''}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write down your thoughts and reflections..."
            className="min-h-32"
            disabled={isComplete}
          />
          {!isComplete && (
            <Button
              onClick={() => saveReflectionMutation.mutate(reflection)}
              disabled={!reflection || saveReflectionMutation.isPending}
              className="w-full"
            >
              Save Reflection
            </Button>
          )}
        </div>

        {isComplete && (
          <Button onClick={() => window.location.href = '/investments'} className="w-full mt-4">
            Return to Investments
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground mt-6">
          This mandatory cooling-off period helps protect you from impulsive decisions.
          Research shows that emotional traders lose 20-40% more than rational investors.
        </p>
      </Card>
    </div>
  );
}
