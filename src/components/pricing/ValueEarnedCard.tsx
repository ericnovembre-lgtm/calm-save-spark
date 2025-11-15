import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Heart, Sparkles, ArrowUp, ArrowDown, Plus, Minus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FREE_FEATURE_INDICES, FREEMIUM_FEATURE_ORDER } from '@/lib/constants';
import { AnimatedCounter } from '@/components/onboarding/AnimatedCounter';
import Animated3DCard from './advanced/Animated3DCard';

interface ValueEarnedCardProps {
  userId: string;
  currentMonthlyContribution: number;
  projectedTier: number;
}

export default function ValueEarnedCard({ 
  userId, 
  currentMonthlyContribution, 
  projectedTier 
}: ValueEarnedCardProps) {
  const [totalContributed, setTotalContributed] = useState(0);
  const [monthsActive, setMonthsActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showProjection, setShowProjection] = useState(false);

  useEffect(() => {
    calculateValue();
  }, [userId]);

  useEffect(() => {
    // Show projection when slider changes
    setShowProjection(true);
    const timer = setTimeout(() => setShowProjection(false), 3000);
    return () => clearTimeout(timer);
  }, [projectedTier]);

  const calculateValue = async () => {
    try {
      // Get user's subscription history
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('created_at, subscription_amount')
        .eq('user_id', userId)
        .single();

      if (subscription) {
        // Calculate months since subscription
        const createdDate = new Date(subscription.created_at);
        const now = new Date();
        const months = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        
        setMonthsActive(months);
        
        // Simplified calculation: current amount * months
        // In production, you'd query subscription_history for accurate totals
        const estimated = subscription.subscription_amount * months;
        setTotalContributed(estimated);
      }
    } catch (error) {
      console.error('Error calculating value:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureCount = (amount: number): number => {
    if (amount === 0) return FREE_FEATURE_INDICES.length; // 3 free features
    return Math.min(amount, FREEMIUM_FEATURE_ORDER.length); // Cap at 20
  };

  const getFeatureInsights = () => {
    const currentFeatures = getFeatureCount(currentMonthlyContribution);
    const projectedFeatures = getFeatureCount(projectedTier);
    const featureDelta = projectedFeatures - currentFeatures;
    const isUpgrade = featureDelta > 0;
    const isDowngrade = featureDelta < 0;
    const isUnchanged = featureDelta === 0;

    return {
      currentFeatures,
      projectedFeatures,
      featureDelta: Math.abs(featureDelta),
      isUpgrade,
      isDowngrade,
      isUnchanged,
      message: isUpgrade
        ? `Moving to $${projectedTier}/mo gives you ${projectedFeatures} total features — that's ${Math.abs(featureDelta)} more than your current plan!`
        : isDowngrade
        ? `Adjusting to $${projectedTier}/mo gives you ${projectedFeatures} features. You'll lose access to ${Math.abs(featureDelta)} feature${Math.abs(featureDelta) === 1 ? '' : 's'}.`
        : `You're currently on the $${projectedTier}/mo plan with ${currentFeatures} feature${currentFeatures === 1 ? '' : 's'}. Thank you for your support!`
    };
  };

  const getContributionProjection = () => {
    const futureMonths = 6; // Project 6 months ahead
    const projectedMonthly = projectedTier;
    const futureTotal = totalContributed + (projectedMonthly * futureMonths);
    
    return {
      futureMonths,
      projectedMonthly,
      futureTotal,
      additionalContribution: projectedMonthly * futureMonths
    };
  };

  const featureInsights = getFeatureInsights();
  const projection = getContributionProjection();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Animated3DCard intensity={0.5}>
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              Your Impact
            </CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {monthsActive} month{monthsActive === 1 ? '' : 's'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Contribution Display */}
            <div>
              <div className="text-3xl font-bold text-primary">
                <AnimatedCounter value={totalContributed} prefix="$" duration={1} />
              </div>
              <p className="text-sm text-muted-foreground">
                Total contributed to $ave+ over {monthsActive} month{monthsActive === 1 ? '' : 's'}
              </p>
            </div>

            {/* Feature Count Insights with Visual Delta */}
            <div className="space-y-2">
              <div className={`flex items-start gap-2 p-3 rounded-lg ${
                featureInsights.isUpgrade ? 'bg-primary/10 border border-primary/20' :
                featureInsights.isDowngrade ? 'bg-destructive/10 border border-destructive/20' :
                'bg-background/50'
              }`}>
                {featureInsights.isUpgrade && (
                  <ArrowUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                )}
                {featureInsights.isDowngrade && (
                  <ArrowDown className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                )}
                {featureInsights.isUnchanged && (
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {featureInsights.message}
                  </p>
                  
                  {/* Visual Feature Delta Indicator */}
                  {!featureInsights.isUnchanged && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-medium">{featureInsights.currentFeatures}</span>
                        <span className="text-muted-foreground">current</span>
                      </div>
                      {featureInsights.isUpgrade ? (
                        <Plus className="w-3 h-3 text-primary" />
                      ) : (
                        <Minus className="w-3 h-3 text-destructive" />
                      )}
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <AnimatedCounter 
                          value={featureInsights.featureDelta} 
                          duration={0.5}
                        />
                        <span className={featureInsights.isUpgrade ? 'text-primary' : 'text-destructive'}>
                          {featureInsights.isUpgrade ? 'gained' : 'lost'}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <AnimatedCounter 
                          value={featureInsights.projectedFeatures} 
                          duration={0.5}
                        />
                        <span className="text-muted-foreground">total</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-Time Contribution Projection */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: showProjection ? 1 : 0, 
                  height: showProjection ? 'auto' : 0 
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      6-month projection at ${projectedTier}/mo
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary">
                        <AnimatedCounter 
                          value={projection.futureTotal} 
                          prefix="$" 
                          duration={1}
                        />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        total contributed
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <AnimatedCounter 
                        value={projection.additionalContribution} 
                        prefix="+$" 
                        duration={0.8}
                      /> in the next 6 months
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Animated3DCard>
  );
}
