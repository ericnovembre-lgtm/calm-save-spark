import { motion } from 'framer-motion';
import { 
  DollarSign, Target, PieChart, TrendingUp, 
  Gauge, Flame, BarChart3, Hash 
} from 'lucide-react';
import { WidgetType } from '@/hooks/useWidgetBuilder';

interface WidgetPaletteProps {
  onAddWidget: (type: WidgetType) => void;
}

const widgetTypes: { type: WidgetType; label: string; icon: typeof DollarSign; description: string }[] = [
  {
    type: 'balance_display',
    label: 'Balance',
    icon: DollarSign,
    description: 'Show account balance',
  },
  {
    type: 'goal_progress',
    label: 'Goal Progress',
    icon: Target,
    description: 'Track goal completion',
  },
  {
    type: 'spending_chart',
    label: 'Spending',
    icon: PieChart,
    description: 'Visualize spending',
  },
  {
    type: 'net_worth',
    label: 'Net Worth',
    icon: TrendingUp,
    description: 'Net worth tracker',
  },
  {
    type: 'budget_gauge',
    label: 'Budget',
    icon: Gauge,
    description: 'Budget gauge meter',
  },
  {
    type: 'streak_counter',
    label: 'Streak',
    icon: Flame,
    description: 'Savings streak',
  },
  {
    type: 'quick_stats',
    label: 'Quick Stats',
    icon: BarChart3,
    description: 'Key statistics',
  },
  {
    type: 'custom_metric',
    label: 'Custom',
    icon: Hash,
    description: 'Custom metric',
  },
];

export function WidgetPalette({ onAddWidget }: WidgetPaletteProps) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <h3 className="font-semibold mb-4">Widget Palette</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {widgetTypes.map((widget, index) => {
          const Icon = widget.icon;
          
          return (
            <motion.button
              key={widget.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onAddWidget(widget.type)}
              className="p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">{widget.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{widget.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
