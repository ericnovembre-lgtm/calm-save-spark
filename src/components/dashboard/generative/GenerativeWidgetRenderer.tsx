import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  Lightbulb, 
  Zap,
  Wallet,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { GenerativeWidgetSpec } from '@/hooks/useClaudeGenerativeDashboard';

interface GenerativeWidgetRendererProps {
  widget: GenerativeWidgetSpec;
  size?: 'hero' | 'large' | 'medium' | 'compact';
  className?: string;
}

const moodStyles = {
  calm: {
    border: 'border-border/50',
    bg: 'bg-card/80',
    accent: 'text-muted-foreground',
    glow: ''
  },
  energetic: {
    border: 'border-amber-500/30',
    bg: 'bg-gradient-to-br from-card to-secondary/30',
    accent: 'text-amber-600',
    glow: 'shadow-amber-500/10 shadow-lg'
  },
  cautionary: {
    border: 'border-orange-500/30',
    bg: 'bg-gradient-to-br from-card to-orange-100/20',
    accent: 'text-orange-600',
    glow: 'shadow-orange-500/10 shadow-lg'
  },
  celebratory: {
    border: 'border-yellow-500/30',
    bg: 'bg-gradient-to-br from-card to-yellow-100/20',
    accent: 'text-yellow-600',
    glow: 'shadow-yellow-500/20 shadow-lg'
  }
};

const widgetIcons: Record<string, React.ElementType> = {
  balance_hero: Wallet,
  goal_progress: Target,
  spending_breakdown: PieChart,
  upcoming_bills: Calendar,
  cashflow_forecast: TrendingUp,
  ai_insight: Lightbulb,
  quick_actions: Zap,
  savings_streak: Sparkles,
  budget_status: PieChart,
  investment_summary: TrendingUp,
  credit_score: CreditCard,
  net_worth: Wallet
};

export function GenerativeWidgetRenderer({ 
  widget, 
  size = 'medium',
  className 
}: GenerativeWidgetRendererProps) {
  const styles = moodStyles[widget.mood];
  const Icon = widgetIcons[widget.id] || Sparkles;

  const sizeClasses = {
    hero: 'col-span-full min-h-[280px]',
    large: 'col-span-2 min-h-[220px]',
    medium: 'col-span-1 min-h-[180px]',
    compact: 'col-span-1 min-h-[140px]'
  };

  const renderContent = () => {
    switch (widget.type) {
      case 'metric':
        return (
          <div className="flex flex-col gap-4">
            {widget.data?.value && (
              <div className={cn("text-4xl font-bold tracking-tight", styles.accent)}>
                ${typeof widget.data.value === 'number' 
                  ? widget.data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })
                  : widget.data.value}
              </div>
            )}
            {widget.data?.trend && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className={cn("h-4 w-4", widget.data.trend > 0 ? 'text-emerald-500' : 'text-rose-500')} />
                <span>{widget.data.trend > 0 ? '+' : ''}{widget.data.trend}% this month</span>
              </div>
            )}
            {widget.body && (
              <p className="text-sm text-muted-foreground leading-relaxed">{widget.body}</p>
            )}
          </div>
        );

      case 'chart':
        return (
          <div className="flex flex-col gap-3">
            {widget.data?.items?.map((item: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={styles.accent}>{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
            {widget.body && (
              <p className="text-xs text-muted-foreground mt-2">{widget.body}</p>
            )}
          </div>
        );

      case 'list':
        return (
          <ul className="space-y-2">
            {widget.data?.items?.map((item: any, i: number) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={styles.accent}>{item.value}</span>
              </li>
            ))}
          </ul>
        );

      case 'narrative':
        return (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-foreground/90">{widget.body}</p>
            {widget.data?.action && (
              <Button variant="ghost" size="sm" className="group">
                {widget.data.action}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        );

      case 'action':
        return (
          <div className="grid grid-cols-2 gap-2">
            {widget.data?.actions?.map((action: any, i: number) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm"
                className={cn("justify-start", styles.border)}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        );

      case 'hybrid':
      default:
        return (
          <div className="space-y-3">
            {widget.data?.metric && (
              <div className={cn("text-2xl font-semibold", styles.accent)}>
                {widget.data.metric}
              </div>
            )}
            {widget.body && (
              <p className="text-sm text-muted-foreground">{widget.body}</p>
            )}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(sizeClasses[size], className)}
    >
      <Card className={cn(
        "h-full backdrop-blur-sm transition-all duration-300",
        styles.border,
        styles.bg,
        styles.glow,
        "hover:border-primary/30"
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Icon className={cn("h-4 w-4", styles.accent)} />
            {widget.headline}
            {widget.urgencyScore > 70 && (
              <span className="ml-auto flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </motion.div>
  );
}
