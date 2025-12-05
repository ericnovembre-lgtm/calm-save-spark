import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfDay, subDays, format } from 'date-fns';

export interface WidgetEngagement {
  widgetId: string;
  viewCount: number;
  clickCount: number;
  avgDurationMs: number;
  pinCount: number;
  unpinCount: number;
  hideCount: number;
}

export interface ActionClickThrough {
  actionName: string;
  count: number;
  widgetId: string;
}

export interface DailyEngagement {
  date: string;
  views: number;
  clicks: number;
  actions: number;
}

export interface WidgetAnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  totalActions: number;
  avgSessionDuration: number;
  mostViewedWidget: string;
  mostClickedAction: string;
}

export function useWidgetAnalyticsData(days: number = 30) {
  const { user } = useAuth();

  // Fetch raw analytics data
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['widget-analytics', user?.id, days],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const startDate = subDays(new Date(), days).toISOString();
      
      const { data, error } = await supabase
        .from('widget_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Process widget engagement data
  const widgetEngagement: WidgetEngagement[] = (() => {
    if (!rawData) return [];
    
    const grouped = rawData.reduce((acc, event) => {
      if (!acc[event.widget_id]) {
        acc[event.widget_id] = {
          widgetId: event.widget_id,
          viewCount: 0,
          clickCount: 0,
          avgDurationMs: 0,
          pinCount: 0,
          unpinCount: 0,
          hideCount: 0,
          totalDuration: 0,
          durationCount: 0,
        };
      }
      
      const w = acc[event.widget_id];
      switch (event.event_type) {
        case 'view':
          w.viewCount++;
          if (event.duration_ms) {
            w.totalDuration += event.duration_ms;
            w.durationCount++;
          }
          break;
        case 'click':
          w.clickCount++;
          break;
        case 'pin':
          w.pinCount++;
          break;
        case 'unpin':
          w.unpinCount++;
          break;
        case 'hide':
          w.hideCount++;
          break;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped).map((w: any) => ({
      ...w,
      avgDurationMs: w.durationCount > 0 ? Math.round(w.totalDuration / w.durationCount) : 0,
    }));
  })();

  // Process action click-through data
  const actionClickThrough: ActionClickThrough[] = (() => {
    if (!rawData) return [];
    
    const actions = rawData.filter(e => e.event_type === 'action' && e.action_name);
    const grouped = actions.reduce((acc, event) => {
      const key = `${event.widget_id}-${event.action_name}`;
      if (!acc[key]) {
        acc[key] = {
          actionName: event.action_name!,
          widgetId: event.widget_id,
          count: 0,
        };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, ActionClickThrough>);
    
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  })();

  // Process daily engagement data
  const dailyEngagement: DailyEngagement[] = (() => {
    if (!rawData) return [];
    
    const grouped = rawData.reduce((acc, event) => {
      const date = format(new Date(event.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, views: 0, clicks: 0, actions: 0 };
      }
      
      switch (event.event_type) {
        case 'view':
          acc[date].views++;
          break;
        case 'click':
          acc[date].clicks++;
          break;
        case 'action':
          acc[date].actions++;
          break;
      }
      
      return acc;
    }, {} as Record<string, DailyEngagement>);
    
    // Fill in missing days
    const result: DailyEngagement[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      result.push(grouped[date] || { date, views: 0, clicks: 0, actions: 0 });
    }
    
    return result;
  })();

  // Calculate summary
  const summary: WidgetAnalyticsSummary = (() => {
    const totalViews = widgetEngagement.reduce((sum, w) => sum + w.viewCount, 0);
    const totalClicks = widgetEngagement.reduce((sum, w) => sum + w.clickCount, 0);
    const totalActions = actionClickThrough.reduce((sum, a) => sum + a.count, 0);
    
    const totalDuration = widgetEngagement.reduce((sum, w) => sum + (w.avgDurationMs * w.viewCount), 0);
    const avgSessionDuration = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;
    
    const mostViewed = widgetEngagement.sort((a, b) => b.viewCount - a.viewCount)[0];
    const mostClicked = actionClickThrough[0];
    
    return {
      totalViews,
      totalClicks,
      totalActions,
      avgSessionDuration,
      mostViewedWidget: mostViewed?.widgetId || 'N/A',
      mostClickedAction: mostClicked?.actionName || 'N/A',
    };
  })();

  return {
    widgetEngagement,
    actionClickThrough,
    dailyEngagement,
    summary,
    isLoading,
    error,
    rawData,
  };
}
