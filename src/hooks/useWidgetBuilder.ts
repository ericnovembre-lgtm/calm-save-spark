import { useState, useCallback } from 'react';

export type WidgetType = 
  | 'balance_display'
  | 'goal_progress'
  | 'spending_chart'
  | 'net_worth'
  | 'budget_gauge'
  | 'streak_counter'
  | 'quick_stats'
  | 'custom_metric';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: {
    colorScheme?: 'default' | 'warm' | 'cool' | 'monochrome';
    showLabels?: boolean;
    animated?: boolean;
    dataSource?: string;
    refreshInterval?: number;
    customStyles?: Record<string, string>;
  };
}

export interface WidgetTemplate {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  layout: 'grid' | 'freeform';
  theme: 'light' | 'dark' | 'system';
}

export function useWidgetBuilder() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'freeform'>('grid');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const addWidget = useCallback((type: WidgetType) => {
    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type,
      title: getDefaultTitle(type),
      position: { x: 0, y: widgets.length * 100 },
      size: getDefaultSize(type),
      settings: {
        colorScheme: 'default',
        showLabels: true,
        animated: true,
      },
    };
    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidget(newWidget.id);
    return newWidget;
  }, [widgets.length]);

  const updateWidget = useCallback((id: string, updates: Partial<WidgetConfig>) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
  }, [selectedWidget]);

  const moveWidget = useCallback((id: string, position: { x: number; y: number }) => {
    updateWidget(id, { position });
  }, [updateWidget]);

  const resizeWidget = useCallback((id: string, size: { width: number; height: number }) => {
    updateWidget(id, { size });
  }, [updateWidget]);

  const getTemplate = useCallback((): WidgetTemplate => ({
    id: `template-${Date.now()}`,
    name: 'Untitled Template',
    widgets,
    layout,
    theme,
  }), [widgets, layout, theme]);

  const loadTemplate = useCallback((template: WidgetTemplate) => {
    setWidgets(template.widgets);
    setLayout(template.layout);
    setTheme(template.theme);
    setSelectedWidget(null);
  }, []);

  const clearCanvas = useCallback(() => {
    setWidgets([]);
    setSelectedWidget(null);
  }, []);

  return {
    widgets,
    selectedWidget,
    layout,
    theme,
    setSelectedWidget,
    setLayout,
    setTheme,
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    resizeWidget,
    getTemplate,
    loadTemplate,
    clearCanvas,
  };
}

function getDefaultTitle(type: WidgetType): string {
  const titles: Record<WidgetType, string> = {
    balance_display: 'Account Balance',
    goal_progress: 'Goal Progress',
    spending_chart: 'Spending Chart',
    net_worth: 'Net Worth',
    budget_gauge: 'Budget Status',
    streak_counter: 'Savings Streak',
    quick_stats: 'Quick Stats',
    custom_metric: 'Custom Metric',
  };
  return titles[type];
}

function getDefaultSize(type: WidgetType): { width: number; height: number } {
  const sizes: Record<WidgetType, { width: number; height: number }> = {
    balance_display: { width: 200, height: 120 },
    goal_progress: { width: 200, height: 150 },
    spending_chart: { width: 300, height: 200 },
    net_worth: { width: 250, height: 180 },
    budget_gauge: { width: 180, height: 180 },
    streak_counter: { width: 150, height: 100 },
    quick_stats: { width: 250, height: 120 },
    custom_metric: { width: 200, height: 150 },
  };
  return sizes[type];
}
