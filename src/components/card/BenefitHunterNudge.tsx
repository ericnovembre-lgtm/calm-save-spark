import { motion } from 'framer-motion';
import { useBenefitHunter } from '@/hooks/useBenefitHunter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface BenefitHunterNudgeProps {
  maxDisplay?: number;
  onViewAll?: () => void;
}

export const BenefitHunterNudge = ({ maxDisplay = 1, onViewAll }: BenefitHunterNudgeProps) => {
  const { matches, activateBenefit, dismissBenefit } = useBenefitHunter();

  // Get top priority matches (most urgent or highest confidence)
  const topMatches = matches
    .sort((a, b) => {
      // Sort by urgency (expiring soon first) then confidence
      const aExpiry = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
      const bExpiry = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
      
      if (aExpiry !== bExpiry) {
        return aExpiry - bExpiry;
      }
      
      return b.match_confidence - a.match_confidence;
    })
    .slice(0, maxDisplay);

  if (topMatches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {topMatches.map((match) => {
        const IconComponent = (Icons as any)[match.benefit.icon] || Icons.Gift;
        
        const daysUntilExpiry = match.expires_at 
          ? Math.ceil((new Date(match.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        return (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Unused Perk Alert
                      </h4>
                      {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                        <Badge 
                          variant={daysUntilExpiry <= 2 ? 'destructive' : 'secondary'}
                          className="flex-shrink-0"
                        >
                          {daysUntilExpiry}d left
                        </Badge>
                      )}
                    </div>

                    {match.transaction && (
                      <p className="text-sm text-muted-foreground mb-2">
                        You bought at <span className="font-medium text-foreground">{match.transaction.merchant_name}</span>
                      </p>
                    )}

                    <p className="text-sm mb-3 line-clamp-2">
                      Don't forget to activate your <span className="font-semibold text-primary">{match.benefit.benefit_name}</span>!
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {match.benefit.activation_required && match.benefit.activation_url ? (
                        <Button
                          onClick={() => {
                            window.open(match.benefit.activation_url!, '_blank');
                            activateBenefit(match.id);
                          }}
                          size="sm"
                          className="h-8 text-xs"
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          onClick={() => activateBenefit(match.id)}
                          size="sm"
                          variant="default"
                          className="h-8 text-xs"
                        >
                          Got It
                        </Button>
                      )}
                      
                      {onViewAll && (
                        <Button
                          onClick={onViewAll}
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                        >
                          View All
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => dismissBenefit(match.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
