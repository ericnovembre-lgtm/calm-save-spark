import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, TrendingUp, TrendingDown, Mail, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export function WeeklyRecap() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['weekly_insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('weekly_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const markAsViewedMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('weekly_insights')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_insights'] });
    },
  });

  const latestInsight = insights[0];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold">Weekly Recap</h3>
        {latestInsight && !latestInsight.viewed_at && (
          <Badge variant="outline" className="bg-primary/10">New</Badge>
        )}
      </div>

      {latestInsight ? (
        <div className="space-y-4">
          {/* Latest Week Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-primary/10 to-yellow-500/10 rounded-lg border border-primary/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(latestInsight.week_start), 'MMM d')} -{' '}
                  {format(new Date(latestInsight.week_end), 'MMM d, yyyy')}
                </p>
                <h4 className="text-xl font-bold">This Week's Performance</h4>
              </div>
              <Badge variant="outline" className="gap-1">
                {latestInsight.budget_adherence_score}%
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">
                  ${latestInsight.total_saved?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-muted-foreground">Saved</p>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-600">
                  ${latestInsight.total_spent?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-muted-foreground">Spent</p>
              </div>
            </div>

            {latestInsight.top_category && (
              <div className="text-sm text-muted-foreground mb-3">
                📊 Top spending category: <span className="font-medium text-foreground">{latestInsight.top_category}</span>
              </div>
            )}

            {/* AI Insights */}
            {latestInsight.insights && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Key Insights
                </p>
                <ul className="space-y-1">
                  {(latestInsight.insights as any).summary?.map((insight: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!latestInsight.viewed_at && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 gap-2"
                onClick={() => markAsViewedMutation.mutate(latestInsight.id)}
              >
                <Eye className="w-4 h-4" />
                Mark as Read
              </Button>
            )}
          </motion.div>

          {/* Previous Weeks */}
          {insights.length > 1 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Previous Weeks</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {insights.slice(1).map((insight) => (
                    <Card key={insight.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(insight.week_start), 'MMM d')} -{' '}
                            {format(new Date(insight.week_end), 'MMM d')}
                          </p>
                          <div className="flex gap-3 mt-1 text-xs">
                            <span className="text-green-600">
                              Saved: ${insight.total_saved?.toFixed(2)}
                            </span>
                            <span className="text-orange-600">
                              Spent: ${insight.total_spent?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">{insight.budget_adherence_score}%</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No weekly recaps yet</p>
          <p className="text-xs text-muted-foreground mt-2">
            Your first recap will be generated next week
          </p>
        </Card>
      )}
    </Card>
  );
}
