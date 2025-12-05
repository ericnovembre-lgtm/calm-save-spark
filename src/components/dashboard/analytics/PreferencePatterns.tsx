import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type WidgetEngagement } from '@/hooks/useWidgetAnalyticsData';
import { TrendingUp, TrendingDown, Eye, EyeOff, Pin } from 'lucide-react';

interface PreferencePatternsProps {
  data: WidgetEngagement[];
}

export function PreferencePatterns({ data }: PreferencePatternsProps) {
  const totalPins = data.reduce((sum, w) => sum + w.pinCount, 0);
  const totalUnpins = data.reduce((sum, w) => sum + w.unpinCount, 0);
  const totalHides = data.reduce((sum, w) => sum + w.hideCount, 0);
  
  const mostPinned = data.sort((a, b) => b.pinCount - a.pinCount).slice(0, 3);
  const mostHidden = data.sort((a, b) => b.hideCount - a.hideCount).slice(0, 3);

  const formatWidgetName = (id: string) => 
    id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Preference Patterns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Pin className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-semibold text-emerald-500">{totalPins}</p>
            <p className="text-xs text-muted-foreground">Pinned</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <TrendingDown className="h-4 w-4 mx-auto mb-1 text-amber-500" />
            <p className="text-lg font-semibold text-amber-500">{totalUnpins}</p>
            <p className="text-xs text-muted-foreground">Unpinned</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <EyeOff className="h-4 w-4 mx-auto mb-1 text-rose-500" />
            <p className="text-lg font-semibold text-rose-500">{totalHides}</p>
            <p className="text-xs text-muted-foreground">Hidden</p>
          </div>
        </div>

        {/* Most Pinned */}
        {mostPinned.some(w => w.pinCount > 0) && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Most Pinned
            </h4>
            <div className="space-y-2">
              {mostPinned.filter(w => w.pinCount > 0).map(widget => (
                <div key={widget.widgetId} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatWidgetName(widget.widgetId)}</span>
                  <span className="font-medium text-emerald-500">{widget.pinCount}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Hidden */}
        {mostHidden.some(w => w.hideCount > 0) && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-rose-500" />
              Most Hidden
            </h4>
            <div className="space-y-2">
              {mostHidden.filter(w => w.hideCount > 0).map(widget => (
                <div key={widget.widgetId} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatWidgetName(widget.widgetId)}</span>
                  <span className="font-medium text-rose-500">{widget.hideCount}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalPins === 0 && totalHides === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No preference data yet. Pin or hide widgets to see patterns.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
