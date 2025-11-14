/**
 * @fileoverview Shared TypeScript interfaces for Welcome page components
 * 
 * Centralizes type definitions used across welcome section components
 * for better type reusability and maintainability.
 * 
 * @module components/welcome/types
 */

/**
 * Feature data structure for feature cards and highlights
 * 
 * @interface Feature
 */
export interface Feature {
  /** Unique identifier for the feature */
  id: string;
  
  /** Display title of the feature */
  title: string;
  
  /** Short description explaining the feature */
  description: string;
  
  /** Icon name from lucide-react or custom icon set */
  icon: string;
  
  /** Optional detailed explanation shown in modal or card back */
  details?: string;
}

/**
 * Breakdown data for expandable stat cards
 * 
 * @interface StatBreakdown
 */
export interface StatBreakdown {
  /** Label for the breakdown item */
  label: string;
  
  /** Formatted value to display */
  value: string;
  
  /** Percentage for progress bar (0-100) */
  percentage: number;
}

/**
 * Statistic data structure for stat cards
 * 
 * @interface Stat
 */
export interface Stat {
  /** Display label for the statistic */
  label: string;
  
  /** Numeric value to display */
  value: number;
  
  /** Optional suffix (e.g., "+", "M", "%") */
  suffix?: string;
  
  /** Optional icon element to display */
  icon?: React.ReactNode;
  
  /** Optional animation delay in seconds */
  delay?: number;
  
  /** Optional breakdown data for expandable cards */
  breakdown?: StatBreakdown[];
}

/**
 * Milestone data structure for journey timeline
 * 
 * @interface Milestone
 */
export interface Milestone {
  /** Unique identifier for the milestone */
  id: string;
  
  /** Display title of the milestone */
  title: string;
  
  /** Description explaining the milestone */
  description: string;
  
  /** Icon name from lucide-react or custom icon set */
  icon: string;
  
  /** Timeframe when milestone is typically achieved */
  timeframe: string;
  
  /** Whether the milestone has been completed */
  completed?: boolean;
}
