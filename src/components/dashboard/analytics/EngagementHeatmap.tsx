import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type DailyEngagement } from '@/hooks/useWidgetAnalyticsData';
import { format, parseISO, getDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface EngagementHeatmapProps {
  data: DailyEngagement[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EngagementHeatmap({ data }: EngagementHeatmapProps) {
  const { weeks, maxEngagement } = useMemo(() => {
    const maxEng = Math.max(...data.map(d => d.views + d.clicks + d.actions), 1);
    
    // Group by weeks
    const weekGroups: DailyEngagement[][] = [];
    let currentWeek: DailyEngagement[] = [];
    
    data.forEach((day, index) => {
      const dayOfWeek = getDay(parseISO(day.date));
      
      if (index === 0) {
        // Pad the first week
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', views: 0, clicks: 0, actions: 0 });
        }
      }
      
      currentWeek.push(day);
      
      if (dayOfWeek === 6 || index === data.length - 1) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return { weeks: weekGroups, maxEngagement: maxEng };
  }, [data]);

  const getIntensity = (engagement: number) => {
    if (engagement === 0) return 'bg-muted/30';
    const ratio = engagement / maxEngagement;
    if (ratio < 0.25) return 'bg-primary/20';
    if (ratio < 0.5) return 'bg-primary/40';
    if (ratio < 0.75) return 'bg-primary/60';
    return 'bg-primary/90';
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Daily Engagement Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          {/* Weekday labels */}
          <div className="flex flex-col gap-1 mr-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="h-3 w-6 text-[10px] text-muted-foreground flex items-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="flex gap-1 overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const totalEngagement = day.views + day.clicks + day.actions;
                  
                  if (!day.date) {
                    return <div key={dayIndex} className="h-3 w-3" />;
                  }
                  
                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "h-3 w-3 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-primary",
                            getIntensity(totalEngagement)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{format(parseISO(day.date), 'MMM d, yyyy')}</p>
                        <p className="text-muted-foreground">
                          {day.views} views • {day.clicks} clicks • {day.actions} actions
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-muted/30" />
            <div className="h-3 w-3 rounded-sm bg-primary/20" />
            <div className="h-3 w-3 rounded-sm bg-primary/40" />
            <div className="h-3 w-3 rounded-sm bg-primary/60" />
            <div className="h-3 w-3 rounded-sm bg-primary/90" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
