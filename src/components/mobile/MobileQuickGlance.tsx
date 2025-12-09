import { motion } from 'framer-motion';
import { Wallet, PiggyBank, Target, TrendingUp, CreditCard, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileQuickGlanceProps {
  widgets: string[];
}

interface GlanceWidget {
  id: string;
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: typeof Wallet;
  color: string;
}

const widgetConfigs: Record<string, GlanceWidget> = {
  balance: {
    id: 'balance',
    title: 'Balance',
    value: '$12,450.00',
    change: '+$340 today',
    changeType: 'positive',
    icon: Wallet,
    color: 'bg-emerald-500/10 text-emerald-500'
  },
  budget: {
    id: 'budget',
    title: 'Budget Left',
    value: '$1,280.00',
    change: '68% remaining',
    changeType: 'neutral',
    icon: Receipt,
    color: 'bg-yellow-500/10 text-yellow-500'
  },
  goals: {
    id: 'goals',
    title: 'Goals',
    value: '72%',
    change: '3 active goals',
    changeType: 'positive',
    icon: Target,
    color: 'bg-amber-500/10 text-amber-500'
  },
  savings: {
    id: 'savings',
    title: 'Savings',
    value: '$5,200.00',
    change: '+$500 this month',
    changeType: 'positive',
    icon: PiggyBank,
    color: 'bg-amber-400/10 text-amber-400'
  },
  investments: {
    id: 'investments',
    title: 'Investments',
    value: '+12.4%',
    change: 'Portfolio gain',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'bg-amber-500/10 text-amber-500'
  },
  credit: {
    id: 'credit',
    title: 'Credit Score',
    value: '742',
    change: '+5 this month',
    changeType: 'positive',
    icon: CreditCard,
    color: 'bg-stone-500/10 text-stone-500'
  }
};

export function MobileQuickGlance({ widgets }: MobileQuickGlanceProps) {
  const activeWidgets = widgets
    .map(id => widgetConfigs[id])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-3 gap-3">
      {activeWidgets.map((widget, index) => (
        <motion.div
          key={widget.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-xl p-3 border border-border/50"
        >
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center mb-2",
            widget.color
          )}>
            <widget.icon className="h-4 w-4" />
          </div>
          
          <p className="text-xs text-muted-foreground">{widget.title}</p>
          <p className="text-lg font-semibold text-foreground">{widget.value}</p>
          
          {widget.change && (
            <p className={cn(
              "text-xs mt-1",
              widget.changeType === 'positive' && "text-emerald-500",
              widget.changeType === 'negative' && "text-rose-500",
              widget.changeType === 'neutral' && "text-muted-foreground"
            )}>
              {widget.change}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
