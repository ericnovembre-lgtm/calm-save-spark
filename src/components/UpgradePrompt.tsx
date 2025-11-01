import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface UpgradePromptProps {
  feature: string;
  message: string;
  suggestedAmount?: number;
  compact?: boolean;
}

export function UpgradePrompt({ 
  feature, 
  message, 
  suggestedAmount = 5,
  compact = false 
}: UpgradePromptProps) {
  const navigate = useNavigate();
  const { subscriptionAmount } = useFeatureAccess();

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (compact) {
    return (
      <div className="bg-accent/50 border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-sm mb-1">{feature} Limit Reached</div>
            <p className="text-xs text-muted-foreground mb-3">{message}</p>
            <Button size="sm" onClick={handleUpgrade} className="gap-2">
              <TrendingUp className="w-3 h-3" />
              Upgrade Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl mb-2">
              <Lock className="w-5 h-5 text-primary" />
              Unlock {feature}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Upgrade
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-background/80 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-2">Suggested plan:</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold">${suggestedAmount}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          {subscriptionAmount > 0 && (
            <div className="text-xs text-muted-foreground">
              Currently: ${subscriptionAmount}/month
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Unlock this feature immediately</span>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Access to all features at lower tiers</span>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>14-day free trial, cancel anytime</span>
          </div>
        </div>

        <Button 
          onClick={handleUpgrade}
          className="w-full gap-2"
          size="lg"
        >
          View Pricing Options
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Change your subscription amount anytime
        </p>
      </CardContent>
    </Card>
  );
}
