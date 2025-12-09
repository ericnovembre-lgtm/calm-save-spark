import { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SentimentAlertConfig } from './SentimentAlertConfig';
import { useSentimentAlerts } from '@/hooks/useSentimentAlerts';

interface SentimentAlertButtonProps {
  ticker: string;
  size?: 'sm' | 'default';
  variant?: 'ghost' | 'outline';
}

export const SentimentAlertButton = ({ 
  ticker, 
  size = 'sm',
  variant = 'ghost' 
}: SentimentAlertButtonProps) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { alerts } = useSentimentAlerts();
  
  const hasActiveAlert = alerts.some(a => a.ticker === ticker && a.is_active);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={() => setIsConfigOpen(true)}
            className={`${size === 'sm' ? 'h-7 w-7 p-0' : 'h-8 px-2'} ${
              hasActiveAlert 
                ? 'text-amber-400 hover:text-amber-300' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {hasActiveAlert ? (
              <BellRing className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            ) : (
              <Bell className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            )}
            {size !== 'sm' && <span className="ml-1 text-xs">Alert</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasActiveAlert ? 'Manage alerts' : 'Set up alert'}
        </TooltipContent>
      </Tooltip>

      <SentimentAlertConfig
        ticker={ticker}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
};
