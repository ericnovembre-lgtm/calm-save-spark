import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WidgetPreferences {
  pinnedWidgets: string[];
  hiddenWidgets: string[];
  widgetOrder: string[];
}

const DEFAULT_PREFERENCES: WidgetPreferences = {
  pinnedWidgets: [],
  hiddenWidgets: [],
  widgetOrder: [],
};

export function useWidgetPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['widget-preferences', user?.id],
    queryFn: async (): Promise<WidgetPreferences> => {
      if (!user?.id) return DEFAULT_PREFERENCES;

      const { data, error } = await supabase
        .from('dashboard_widget_preferences')
        .select('pinned_widgets, hidden_widgets, widget_order')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to fetch widget preferences:', error);
        return DEFAULT_PREFERENCES;
      }

      if (!data) return DEFAULT_PREFERENCES;

      return {
        pinnedWidgets: data.pinned_widgets || [],
        hiddenWidgets: data.hidden_widgets || [],
        widgetOrder: data.widget_order || [],
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<WidgetPreferences>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const updateData: Record<string, any> = {};
      if (updates.pinnedWidgets !== undefined) updateData.pinned_widgets = updates.pinnedWidgets;
      if (updates.hiddenWidgets !== undefined) updateData.hidden_widgets = updates.hiddenWidgets;
      if (updates.widgetOrder !== undefined) updateData.widget_order = updates.widgetOrder;

      const { error } = await supabase
        .from('dashboard_widget_preferences')
        .upsert({
          user_id: user.id,
          ...updateData,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-preferences', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to update widget preferences:', error);
      toast({
        title: 'Failed to save preferences',
        description: 'Your changes could not be saved. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Pin/unpin a widget
  const togglePin = useCallback((widgetId: string) => {
    const current = preferences || DEFAULT_PREFERENCES;
    const isPinned = current.pinnedWidgets.includes(widgetId);
    
    const newPinned = isPinned
      ? current.pinnedWidgets.filter(id => id !== widgetId)
      : [...current.pinnedWidgets, widgetId];

    updateMutation.mutate({ pinnedWidgets: newPinned });
  }, [preferences, updateMutation]);

  // Hide/show a widget
  const toggleHide = useCallback((widgetId: string) => {
    const current = preferences || DEFAULT_PREFERENCES;
    const isHidden = current.hiddenWidgets.includes(widgetId);
    
    const newHidden = isHidden
      ? current.hiddenWidgets.filter(id => id !== widgetId)
      : [...current.hiddenWidgets, widgetId];

    updateMutation.mutate({ hiddenWidgets: newHidden });
  }, [preferences, updateMutation]);

  // Update widget order
  const updateOrder = useCallback((newOrder: string[]) => {
    updateMutation.mutate({ widgetOrder: newOrder });
  }, [updateMutation]);

  // Check if widget is pinned
  const isPinned = useCallback((widgetId: string) => {
    return preferences?.pinnedWidgets.includes(widgetId) ?? false;
  }, [preferences]);

  // Check if widget is hidden
  const isHidden = useCallback((widgetId: string) => {
    return preferences?.hiddenWidgets.includes(widgetId) ?? false;
  }, [preferences]);

  // Reset all preferences
  const resetPreferences = useCallback(() => {
    updateMutation.mutate(DEFAULT_PREFERENCES);
    toast({
      title: 'Preferences reset',
      description: 'Your dashboard has been restored to default settings.',
    });
  }, [updateMutation, toast]);

  return {
    preferences: preferences || DEFAULT_PREFERENCES,
    isLoading,
    isSaving: updateMutation.isPending,
    togglePin,
    toggleHide,
    updateOrder,
    isPinned,
    isHidden,
    resetPreferences,
  };
}
