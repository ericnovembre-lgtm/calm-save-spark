import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { BenefitMatch } from '@/hooks/useBenefitHunter';
import { formatDistanceToNow } from 'date-fns';

interface BenefitHunterCardProps {
  match: BenefitMatch;
  onActivate: (matchId: string) => void;
  onDismiss: (matchId: string) => void;
  onViewDetails?: (match: BenefitMatch) => void;
}

export const BenefitHunterCard = ({ 
  match, 
  onActivate, 
  onDismiss,
  onViewDetails 
}: BenefitHunterCardProps) => {
  const IconComponent = (Icons as any)[match.benefit.icon] || Icons.Gift;
  
  const getUrgencyColor = () => {
    if (!match.expires_at) return 'default';
    
    const daysUntilExpiry = Math.ceil(
      (new Date(match.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiry <= 2) return 'destructive';
    if (daysUntilExpiry <= 6) return 'secondary';
    return 'default';
  };

  const getUrgencyBadge = () => {
    if (!match.expires_at) return null;
    
    const daysUntilExpiry = Math.ceil(
      (new Date(match.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiry <= 0) return 'Expired';
    if (daysUntilExpiry <= 2) return `${daysUntilExpiry}d left`;
    if (daysUntilExpiry <= 6) return `${daysUntilExpiry} days left`;
    return null;
  };

  const urgencyBadge = getUrgencyBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-lg text-foreground">
                  {match.benefit.benefit_name}
                </h3>
                {urgencyBadge && (
                  <Badge variant={getUrgencyColor()} className="flex-shrink-0">
                    {urgencyBadge}
                  </Badge>
                )}
              </div>

              {/* Transaction context */}
              {match.transaction && (
                <p className="text-sm text-muted-foreground mb-3">
                  You made a purchase at <span className="font-medium text-foreground">{match.transaction.merchant_name}</span>
                  {' '}({formatDistanceToNow(new Date(match.transaction.transaction_date), { addSuffix: true })})
                </p>
              )}

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">
                {match.benefit.description}
              </p>

              {/* Confidence indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Match confidence</span>
                  <span>{Math.round(match.match_confidence * 100)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${match.match_confidence * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {match.benefit.activation_required && match.benefit.activation_url ? (
                  <Button
                    onClick={() => {
                      window.open(match.benefit.activation_url!, '_blank');
                      onActivate(match.id);
                    }}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    Activate Now
                  </Button>
                ) : (
                  <Button
                    onClick={() => onActivate(match.id)}
                    size="sm"
                    variant="default"
                  >
                    Mark as Used
                  </Button>
                )}
                
                {onViewDetails && (
                  <Button
                    onClick={() => onViewDetails(match)}
                    size="sm"
                    variant="outline"
                  >
                    View Details
                  </Button>
                )}
                
                <Button
                  onClick={() => onDismiss(match.id)}
                  size="sm"
                  variant="ghost"
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
};
