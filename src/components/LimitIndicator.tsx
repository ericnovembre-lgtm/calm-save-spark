import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LimitIndicatorProps {
  current: number;
  max: number;
  label: string;
  showUpgrade?: boolean;
}

export function LimitIndicator({ 
  current, 
  max, 
  label,
  showUpgrade = false 
}: LimitIndicatorProps) {
  const navigate = useNavigate();
  const percentage = max === 999 ? 0 : (current / max) * 100;
  const isUnlimited = max === 999;
  const isNearLimit = percentage >= 80 && !isUnlimited;
  const isAtLimit = current >= max && !isUnlimited;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {isUnlimited ? (
            <Badge variant="secondary" className="text-xs">Unlimited</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">
              {current} / {max}
            </span>
          )}
        </div>
        
        {isAtLimit && showUpgrade && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/pricing')}
            className="gap-1 h-7 text-xs"
          >
            <TrendingUp className="w-3 h-3" />
            Upgrade
          </Button>
        )}
      </div>

      {!isUnlimited && (
        <>
          <Progress 
            value={percentage} 
            className="h-2"
          />
          
          {isNearLimit && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>
                {isAtLimit 
                  ? `You've reached your ${label.toLowerCase()} limit. Upgrade to add more.`
                  : `You're approaching your ${label.toLowerCase()} limit.`}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
