/**
 * Ephemeral Widget Types and Utilities
 * For GenUI Expansion - AI-generated interactive widgets
 */

export type EphemeralWidgetType = 
  | 'feasibility_calculator'
  | 'comparison'
  | 'projection'
  | 'what_if';

export interface FeasibilityData {
  goalAmount: number;
  currentSavings: number;
  monthlyCapacity: number;
  deadline: string;
  feasible: boolean;
  confidenceScore: number;
  recommendation: string;
  alternatives: Array<{
    label: string;
    monthlyAmount: number;
    months: number;
  }>;
}

export interface ComparisonData {
  items: Array<{
    name: string;
    value: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  period: string;
  insight: string;
}

export interface ProjectionData {
  currentValue: number;
  projectedValue: number;
  timeline: Array<{
    date: string;
    value: number;
    confidence?: number;
  }>;
  growthRate: number;
  insight: string;
}

export interface WhatIfData {
  scenarioName: string;
  currentPath: Array<{ month: string; value: number }>;
  modifiedPath: Array<{ month: string; value: number }>;
  difference: number;
  percentChange: number;
  insight: string;
}

export interface EphemeralWidgetSpec {
  widget_type: EphemeralWidgetType;
  title: string;
  data: FeasibilityData | ComparisonData | ProjectionData | WhatIfData;
  interactive: boolean;
  expiresAt?: string;
}

export interface NLQResponse {
  type: 'chart' | 'ephemeral_widget';
  chartData?: Array<{ name: string; value: number }>;
  chartType?: 'bar' | 'pie' | 'line';
  insight?: string;
  widget?: EphemeralWidgetSpec;
}

// Type guards
export function isFeasibilityData(data: unknown): data is FeasibilityData {
  return typeof data === 'object' && data !== null && 'goalAmount' in data && 'feasible' in data;
}

export function isComparisonData(data: unknown): data is ComparisonData {
  return typeof data === 'object' && data !== null && 'items' in data && Array.isArray((data as ComparisonData).items);
}

export function isProjectionData(data: unknown): data is ProjectionData {
  return typeof data === 'object' && data !== null && 'timeline' in data && 'projectedValue' in data;
}

export function isWhatIfData(data: unknown): data is WhatIfData {
  return typeof data === 'object' && data !== null && 'currentPath' in data && 'modifiedPath' in data;
}

// Utility to calculate months until goal
export function calculateMonthsToGoal(
  goalAmount: number, 
  currentSavings: number, 
  monthlyContribution: number
): number {
  const remaining = goalAmount - currentSavings;
  if (remaining <= 0) return 0;
  if (monthlyContribution <= 0) return Infinity;
  return Math.ceil(remaining / monthlyContribution);
}

// Utility to check if deadline is achievable
export function isDeadlineAchievable(
  goalAmount: number,
  currentSavings: number,
  monthlyCapacity: number,
  deadline: string
): boolean {
  const monthsRemaining = Math.max(0, 
    (new Date(deadline).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)
  );
  const requiredMonthly = (goalAmount - currentSavings) / monthsRemaining;
  return requiredMonthly <= monthlyCapacity;
}
