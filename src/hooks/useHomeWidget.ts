import { useEffect, useCallback } from 'react';

interface WidgetData { balance?: number; currency?: string; goalName?: string; goalProgress?: number; goalTarget?: number; }

export function useHomeWidget() {
  const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();

  const updateBalance = useCallback(async (amount: number, currency = 'USD') => {
    if (!isNative) return;
    try { await (window as any).Capacitor?.Plugins?.WidgetBridge?.updateBalance({ amount, currency, timestamp: new Date().toISOString() }); } catch (e) { console.warn('Widget bridge unavailable'); }
  }, [isNative]);

  const updateGoalProgress = useCallback(async (name: string, current: number, target: number) => {
    if (!isNative) return;
    try { await (window as any).Capacitor?.Plugins?.WidgetBridge?.updateGoalProgress({ goalName: name, currentAmount: current, targetAmount: target, progress: target > 0 ? (current / target) * 100 : 0 }); } catch (e) { console.warn('Widget bridge unavailable'); }
  }, [isNative]);

  const syncWidgetData = useCallback(async (data: WidgetData) => {
    if (!isNative) return;
    if (data.balance !== undefined) await updateBalance(data.balance, data.currency);
    if (data.goalName && data.goalProgress !== undefined && data.goalTarget !== undefined) await updateGoalProgress(data.goalName, data.goalProgress, data.goalTarget);
  }, [isNative, updateBalance, updateGoalProgress]);

  return { isNative, isWidgetSupported: isNative, updateBalance, updateGoalProgress, syncWidgetData };
}
