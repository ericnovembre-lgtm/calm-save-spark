import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function EmotionDetectionBar() {
  const { data: latestEmotion } = useQuery({
    queryKey: ['latest-emotion'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trading_emotions')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getEmotionColor = (emotion: string | null) => {
    if (!emotion || emotion === 'neutral') return 'bg-green-500';
    if (['fomo', 'greed'].includes(emotion)) return 'bg-yellow-500';
    if (['fud', 'fear', 'panic'].includes(emotion)) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getEmotionIcon = (emotion: string | null) => {
    if (!emotion || emotion === 'neutral') return <CheckCircle className="w-5 h-5" />;
    if (['fomo', 'greed'].includes(emotion)) return <AlertTriangle className="w-5 h-5" />;
    return <XCircle className="w-5 h-5" />;
  };

  const getEmotionLabel = (emotion: string | null) => {
    if (!emotion || emotion === 'neutral') return 'Calm & Rational';
    if (emotion === 'fomo') return 'FOMO Detected';
    if (emotion === 'fud') return 'FUD Detected';
    if (emotion === 'greed') return 'Greed Detected';
    if (emotion === 'fear') return 'Fear Detected';
    if (emotion === 'panic') return 'Panic Detected';
    return 'Unknown State';
  };

  const getEmotionDescription = (emotion: string | null) => {
    if (!emotion || emotion === 'neutral') return 'Your trading behavior appears rational and calm.';
    if (emotion === 'fomo') return 'You may be rushing into trades due to fear of missing out.';
    if (emotion === 'fud') return 'Detected uncertainty and doubt in your trading decisions.';
    if (emotion === 'greed') return 'Your position sizes suggest excessive risk-taking.';
    if (emotion === 'fear') return 'You may be making decisions driven by fear.';
    if (emotion === 'panic') return 'Detected signs of panic selling or impulsive actions.';
    return 'Unable to assess current emotional state.';
  };

  const emotion = latestEmotion?.detected_emotion;
  const confidence = latestEmotion?.confidence_score || 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">Current Emotional State</h3>
          <p className="text-sm text-muted-foreground">Real-time behavioral analysis</p>
        </div>
        <div className={`${getEmotionColor(emotion)} text-white p-3 rounded-full`}>
          {getEmotionIcon(emotion)}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{getEmotionLabel(emotion)}</span>
            <span className="text-sm text-muted-foreground">
              {confidence > 0 ? `${Math.round(confidence * 100)}% confidence` : 'No recent activity'}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getEmotionColor(emotion)}`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {getEmotionDescription(emotion)}
        </p>

        {latestEmotion && latestEmotion.triggers && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-xs font-semibold text-foreground mb-2">Detected Triggers:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {(latestEmotion.triggers as any)?.triggers?.map((trigger: string, i: number) => (
                <li key={i}>• {trigger}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
