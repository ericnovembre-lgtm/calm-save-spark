import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

export function BehaviorJournal() {
  const { data: emotions, isLoading } = useQuery({
    queryKey: ['behavior-journal'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trading_emotions')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const getEmotionBadge = (emotion: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      neutral: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Neutral' },
      fomo: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'FOMO' },
      fud: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', label: 'FUD' },
      greed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Greed' },
      fear: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', label: 'Fear' },
      panic: { color: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200', label: 'Panic' },
    };
    const variant = variants[emotion] || variants.neutral;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Behavior Journal</h3>
        <p className="text-sm text-muted-foreground">Loading your trading history...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Behavior Journal</h3>
        <Badge variant="outline">{emotions?.length || 0} entries</Badge>
      </div>

      {!emotions || emotions.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No trading activity detected yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your emotional trading patterns will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {emotions.map((emotion) => (
            <div
              key={emotion.id}
              className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getEmotionBadge(emotion.detected_emotion)}
                  <span className="text-xs text-muted-foreground">
                    {Math.round((emotion.confidence_score || 0) * 100)}% confidence
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(emotion.detected_at), 'MMM d, h:mm a')}
                </span>
              </div>

              {emotion.triggers && (emotion.triggers as any).reasoning && (
                <p className="text-sm text-muted-foreground mb-2">
                  {(emotion.triggers as any).reasoning}
                </p>
              )}

              {emotion.triggers && (emotion.triggers as any).triggers && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(emotion.triggers as any).triggers.map((trigger: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-2 flex items-center gap-4 text-xs">
                {emotion.intervention_shown ? (
                  <span className="flex items-center gap-1 text-primary">
                    <TrendingUp className="w-3 h-3" />
                    Intervention shown
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <TrendingDown className="w-3 h-3" />
                    No intervention
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
