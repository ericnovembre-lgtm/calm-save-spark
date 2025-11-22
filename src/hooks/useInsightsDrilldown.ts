import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export type DrillDownView = 'overview' | 'monthly' | 'category';

export interface DrillDownState {
  view: DrillDownView;
  selectedMonth?: string;
  selectedCategory?: string;
}

export function useInsightsDrilldown() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentView = (searchParams.get('view') as DrillDownView) || 'overview';
  const selectedMonth = searchParams.get('month') || undefined;
  const selectedCategory = searchParams.get('category') || undefined;

  const state: DrillDownState = {
    view: currentView,
    selectedMonth,
    selectedCategory,
  };

  const navigateTo = useCallback((newState: Partial<DrillDownState>) => {
    const params = new URLSearchParams();
    
    if (newState.view) params.set('view', newState.view);
    if (newState.selectedMonth) params.set('month', newState.selectedMonth);
    if (newState.selectedCategory) params.set('category', newState.selectedCategory);

    setSearchParams(params);
  }, [setSearchParams]);

  const drillIntoMonth = useCallback((month: string) => {
    navigateTo({ view: 'monthly', selectedMonth: month });
  }, [navigateTo]);

  const drillIntoCategory = useCallback((category: string, month?: string) => {
    navigateTo({ 
      view: 'category', 
      selectedCategory: category,
      selectedMonth: month 
    });
  }, [navigateTo]);

  const goBack = useCallback(() => {
    if (currentView === 'category') {
      if (selectedMonth) {
        navigateTo({ view: 'monthly', selectedMonth });
      } else {
        navigateTo({ view: 'overview' });
      }
    } else if (currentView === 'monthly') {
      navigateTo({ view: 'overview' });
    }
  }, [currentView, selectedMonth, navigateTo]);

  const resetToOverview = useCallback(() => {
    navigateTo({ view: 'overview' });
  }, [navigateTo]);

  const breadcrumbs = [];
  if (currentView === 'overview') {
    breadcrumbs.push({ label: 'Overview', onClick: resetToOverview });
  } else if (currentView === 'monthly') {
    breadcrumbs.push({ label: 'Overview', onClick: resetToOverview });
    breadcrumbs.push({ label: selectedMonth || 'Month', onClick: () => {} });
  } else if (currentView === 'category') {
    breadcrumbs.push({ label: 'Overview', onClick: resetToOverview });
    if (selectedMonth) {
      breadcrumbs.push({ 
        label: selectedMonth, 
        onClick: () => navigateTo({ view: 'monthly', selectedMonth }) 
      });
    }
    breadcrumbs.push({ label: selectedCategory || 'Category', onClick: () => {} });
  }

  return {
    state,
    drillIntoMonth,
    drillIntoCategory,
    goBack,
    resetToOverview,
    breadcrumbs,
    canGoBack: currentView !== 'overview',
  };
}
