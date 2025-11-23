import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TacticalCard } from "./TacticalCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, DollarSign, Star, Flame, Heart, BarChart3 } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";

const variantIcons = {
  aggressive: Flame,
  friendly: Heart,
  data_driven: BarChart3,
};

const variantColors = {
  aggressive: 'text-red-400',
  friendly: 'text-emerald-400',
  data_driven: 'text-cyan-400',
};

export function ScriptAnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['script-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's script variants and outcomes
      const { data: variants, error: variantsError } = await supabase
        .from('negotiation_script_variants')
        .select(`
          *,
          negotiation_script_outcomes (*)
        `)
        .eq('user_id', user.id)
        .not('selected_variant', 'is', null);

      if (variantsError) throw variantsError;

      // Calculate statistics
      const stats = {
        aggressive: { count: 0, success: 0, avgSavings: 0, avgRating: 0 },
        friendly: { count: 0, success: 0, avgSavings: 0, avgRating: 0 },
        data_driven: { count: 0, success: 0, avgSavings: 0, avgRating: 0 },
      };

      variants?.forEach((variant: any) => {
        const selectedVariant = variant.selected_variant as 'aggressive' | 'friendly' | 'data_driven';
        if (selectedVariant && stats[selectedVariant]) {
          stats[selectedVariant].count++;

          const outcomes = variant.negotiation_script_outcomes || [];
          outcomes.forEach((outcome: any) => {
            if (outcome.was_successful) {
              stats[selectedVariant].success++;
              stats[selectedVariant].avgSavings += Number(outcome.actual_savings || 0);
            }
            if (outcome.user_rating) {
              stats[selectedVariant].avgRating += outcome.user_rating;
            }
          });
        }
      });

      // Calculate averages
      Object.keys(stats).forEach((key) => {
        const k = key as 'aggressive' | 'friendly' | 'data_driven';
        const outcomeCount = variants?.filter((v: any) => 
          v.selected_variant === k && 
          v.negotiation_script_outcomes?.length > 0
        ).length || 0;

        if (outcomeCount > 0) {
          stats[k].avgSavings = stats[k].avgSavings / outcomeCount;
          stats[k].avgRating = stats[k].avgRating / outcomeCount;
        }
      });

      return { stats, totalVariants: variants?.length || 0 };
    },
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return <LoadingState variant="inline" />;
  }

  const totalSelections = Object.values(analytics?.stats || {}).reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TacticalCard glowColor="cyan">
          <div className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-cyan-400" />
              <div>
                <div className="text-xs text-muted-foreground font-mono">TOTAL SCRIPTS</div>
                <div className="text-3xl font-bold text-cyan-400 font-mono">
                  {analytics?.totalVariants || 0}
                </div>
              </div>
            </div>
          </div>
        </TacticalCard>

        <TacticalCard glowColor="emerald">
          <div className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="text-xs text-muted-foreground font-mono">SUCCESS RATE</div>
                <div className="text-3xl font-bold text-emerald-400 font-mono">
                  {totalSelections > 0 
                    ? Math.round((Object.values(analytics?.stats || {}).reduce((sum, s) => sum + s.success, 0) / totalSelections) * 100)
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        </TacticalCard>

        <TacticalCard glowColor="amber">
          <div className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-400" />
              <div>
                <div className="text-xs text-muted-foreground font-mono">AVG SAVINGS</div>
                <div className="text-3xl font-bold text-amber-400 font-mono">
                  ${Object.values(analytics?.stats || {})
                    .reduce((sum, s) => sum + s.avgSavings, 0)
                    .toFixed(0)}
                </div>
              </div>
            </div>
          </div>
        </TacticalCard>
      </div>

      {/* Variant Performance */}
      <TacticalCard>
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-foreground font-mono">
            SCRIPT STYLE PERFORMANCE
          </h3>

          {(['aggressive', 'friendly', 'data_driven'] as const).map((variant) => {
            const stats = analytics?.stats[variant];
            if (!stats || stats.count === 0) return null;

            const Icon = variantIcons[variant];
            const color = variantColors[variant];
            const successRate = stats.count > 0 ? (stats.success / stats.count) * 100 : 0;

            return (
              <div key={variant} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${color}`} />
                    <div>
                      <div className="font-semibold text-foreground capitalize">
                        {variant.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Used {stats.count} times
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                      <div className={`text-lg font-bold ${color}`}>
                        {successRate.toFixed(0)}%
                      </div>
                    </div>
                    
                    {stats.avgSavings > 0 && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Avg Savings</div>
                        <div className="text-lg font-bold text-emerald-400">
                          ${stats.avgSavings.toFixed(0)}
                        </div>
                      </div>
                    )}
                    
                    {stats.avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-amber-400">
                          {stats.avgRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Progress value={successRate} className="h-2" />
              </div>
            );
          })}

          {totalSelections === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No script analytics yet. Generate and select a script to see performance data.
            </div>
          )}
        </div>
      </TacticalCard>
    </div>
  );
}
