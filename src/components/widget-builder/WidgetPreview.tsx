import { WidgetConfig } from '@/hooks/useWidgetBuilder';
import { 
  DollarSign, Target, PieChart, TrendingUp, 
  Gauge, Flame, BarChart3, Hash 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WidgetPreviewProps {
  widget: WidgetConfig;
}

export function WidgetPreview({ widget }: WidgetPreviewProps) {
  const colorSchemes = {
    default: 'from-primary/20 to-primary/10',
    warm: 'from-amber-500/20 to-orange-500/10',
    cool: 'from-blue-500/20 to-cyan-500/10',
    monochrome: 'from-gray-500/20 to-gray-400/10',
  };

  const bgClass = colorSchemes[widget.settings.colorScheme || 'default'];

  switch (widget.type) {
    case 'balance_display':
      return (
        <div className={`p-4 rounded-lg bg-gradient-to-br ${bgClass} h-full`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            {widget.settings.showLabels && (
              <span className="text-xs text-muted-foreground">{widget.title}</span>
            )}
          </div>
          <p className="text-2xl font-bold">$12,450</p>
          <p className="text-xs text-green-500">+2.4%</p>
        </div>
      );

    case 'goal_progress':
      return (
        <div className={`p-4 rounded-lg bg-gradient-to-br ${bgClass} h-full`}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            {widget.settings.showLabels && (
              <span className="text-xs text-muted-foreground">{widget.title}</span>
            )}
          </div>
          <Progress value={65} className="h-2 mb-2" />
          <p className="text-sm font-medium">65% complete</p>
        </div>
      );

    case 'spending_chart':
      return (
        <div className={`p-4 rounded-lg bg-gradient-to-br ${bgClass} h-full`}>
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-primary" />
            {widget.settings.showLabels && (
              <span className="text-xs text-muted-foreground">{widget.title}</span>
            )}
          </div>
          <div className="flex gap-1 h-16 items-end">
            {[40, 65, 35, 80, 55].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/60 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      );

    case 'net_worth':
      return (
        <div className={`p-4 rounded-lg bg-gradient-to-br ${bgClass} h-full`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {widget.settings.showLabels && (
              <span className="text-xs text-muted-foreground">{widget.title}</span>
            )}
          </div>
          <p className="text-2xl font-bold">$45,230</p>
          <p className="text-xs text-green-500">↑ $1,240 this month</p>
        </div>
      );

    case 'budget_gauge':
      return (
        <div className={`p-4 rounded-lg bg-gradient-to-br ${bgClass} h-full flex flex-col items-center`}>
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-primary" />
            {widget.settings.showLabels && (
              <span className="text-xs text-muted-foreground">{widget.title}</span>
            )}
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="176" strokeDashoffset="44" className="text-primary" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">75%</span>
          </div>
        </div>
      );

    case 'streak_counter':
      return (
        <div className={`p-4 rounded-lg bg-gradient-to-br ${bgClass} h-full`}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            {widget.settings.showLabels && (
              <span className="text-xs text-muted-foreground">{widget.title}</span>
            )}
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs text-muted-foreground">days</p>
        </div>
      );

    case 'quick_stats':
      return (
        <div className={`p-4 rounded-lg bg-gradient-to-br ${bgClass} h-full`}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            {widget.settings.showLabels && (
              <span className="text-xs text-muted-foreground">{widget.title}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Income</p>
              <p className="font-semibold">$4.2k</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Spent</p>
              <p className="font-semibold">$2.8k</p>
            </div>
          </div>
        </div>
      );

    case 'custom_metric':
      return (
        <div className={`p-4 rounded-lg bg-gradient-to-br ${bgClass} h-full`}>
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-primary" />
            {widget.settings.showLabels && (
              <span className="text-xs text-muted-foreground">{widget.title}</span>
            )}
          </div>
          <p className="text-2xl font-bold">42</p>
          <p className="text-xs text-muted-foreground">custom value</p>
        </div>
      );

    default:
      return (
        <div className="p-4 rounded-lg bg-muted h-full flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Unknown widget</p>
        </div>
      );
  }
}
