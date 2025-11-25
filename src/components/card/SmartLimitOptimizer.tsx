import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartLimitOptimizerProps {
  accountId: string;
  currentLimit?: number;
}

/**
 * Smart Limit Optimizer
 * AI-driven spending limit suggestions based on income and bills
 */
export function SmartLimitOptimizer({ accountId, currentLimit = 0 }: SmartLimitOptimizerProps) {
  const [dailyLimit, setDailyLimit] = useState(currentLimit || 1200);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulated AI suggestion (in production, this would call an edge function)
  const safeHarborLimit = 1200;
  const maxRecommended = 2400;

  const getZone = (limit: number) => {
    if (limit <= safeHarborLimit) return 'safe';
    if (limit <= maxRecommended * 0.75) return 'caution';
    return 'risk';
  };

  const zone = getZone(dailyLimit);

  const zoneConfig = {
    safe: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      icon: Shield,
      label: 'Safe Harbor',
      message: 'This limit keeps you debt-free while allowing flexibility'
    },
    caution: {
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: TrendingUp,
      label: 'Caution Zone',
      message: 'Monitor your spending closely in this range'
    },
    risk: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800',
      icon: AlertCircle,
      label: 'Risk Zone',
      message: 'This limit may lead to financial strain'
    }
  };

  const config = zoneConfig[zone];
  const Icon = config.icon;

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setDailyLimit(safeHarborLimit);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Smart Limit Optimizer</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AI-suggested daily spending limit
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Analyze
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Limit Slider */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Daily Spending Limit
              </div>
              <div className="text-3xl font-bold">${dailyLimit.toLocaleString()}</div>
            </div>
            <Badge variant="outline" className={`${config.color} ${config.border}`}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          <div className="relative pt-2 pb-6">
            <Slider
              value={[dailyLimit]}
              onValueChange={(value) => setDailyLimit(value[0])}
              min={100}
              max={maxRecommended}
              step={50}
              className="cursor-pointer"
            />
            
            {/* Zone Markers */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
              <span>$100</span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                ${safeHarborLimit}
              </span>
              <span>${maxRecommended.toLocaleString()}</span>
            </div>

            {/* Visual Zone Indicator */}
            <div className="absolute bottom-4 left-0 right-0 h-1 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-green-200 dark:bg-green-800/30" />
                <div className="flex-1 bg-amber-200 dark:bg-amber-800/30" />
                <div className="flex-1 bg-red-200 dark:bg-red-800/30" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <motion.div
          key={zone}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${config.bg} ${config.border} border`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
            <div className="flex-1">
              <div className={`text-sm font-semibold mb-1 ${config.color}`}>
                {config.label}
              </div>
              <p className="text-sm text-foreground/80">
                {config.message}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Monthly Est.</div>
            <div className="text-lg font-bold">
              ${(dailyLimit * 30).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Safe Harbor</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              ${safeHarborLimit.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
