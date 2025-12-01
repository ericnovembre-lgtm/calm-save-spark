import { useState } from "react";

export type WidgetId = "dna-orb" | "scenario-simulator" | "opportunity-radar" | "actions-bar";

export interface WidgetState {
  id: WidgetId;
  order: number;
  isCollapsed: boolean;
  isPinned: boolean;
}

const DEFAULT_LAYOUT: WidgetState[] = [
  { id: "actions-bar", order: 0, isCollapsed: false, isPinned: false },
  { id: "dna-orb", order: 1, isCollapsed: false, isPinned: false },
  { id: "scenario-simulator", order: 2, isCollapsed: false, isPinned: false },
  { id: "opportunity-radar", order: 3, isCollapsed: false, isPinned: false },
];

export function useCoachLayout() {
  const [localLayout, setLocalLayout] = useState<WidgetState[]>(() => {
    const stored = localStorage.getItem("coachLayout");
    return stored ? JSON.parse(stored) : DEFAULT_LAYOUT;
  });

  const updateLayout = (newLayout: WidgetState[]) => {
    setLocalLayout(newLayout);
    localStorage.setItem("coachLayout", JSON.stringify(newLayout));
  };

  const reorderWidget = (widgetId: WidgetId, newOrder: number) => {
    const newLayout = localLayout.map((widget) => {
      if (widget.id === widgetId) {
        return { ...widget, order: newOrder };
      }
      return widget;
    });
    // Re-sort by order
    newLayout.sort((a, b) => a.order - b.order);
    // Normalize order indices
    newLayout.forEach((widget, idx) => {
      widget.order = idx;
    });
    updateLayout(newLayout);
  };

  const toggleCollapse = (widgetId: WidgetId) => {
    const newLayout = localLayout.map((widget) =>
      widget.id === widgetId
        ? { ...widget, isCollapsed: !widget.isCollapsed }
        : widget
    );
    updateLayout(newLayout);
  };

  const togglePin = (widgetId: WidgetId) => {
    const newLayout = localLayout.map((widget) =>
      widget.id === widgetId ? { ...widget, isPinned: !widget.isPinned } : widget
    );
    updateLayout(newLayout);
  };

  const resetLayout = () => {
    updateLayout(DEFAULT_LAYOUT);
  };

  const getWidgetState = (widgetId: WidgetId): WidgetState => {
    return (
      localLayout.find((w) => w.id === widgetId) ||
      DEFAULT_LAYOUT.find((w) => w.id === widgetId)!
    );
  };

  return {
    layout: localLayout,
    reorderWidget,
    toggleCollapse,
    togglePin,
    resetLayout,
    getWidgetState,
  };
}
