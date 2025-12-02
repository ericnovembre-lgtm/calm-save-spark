import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, LayoutGrid, Bell, Brain, Target, TrendingUp, Wallet, Shield, Zap, PieChart, Users, Award, Flame, AlertTriangle, Briefcase, Trophy, Map } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const WHATS_NEW_VERSION_KEY = 'whats-new-seen-version';
const CURRENT_VERSION = '2.1.0';

export interface FeatureUpdate {
  version: string;
  date: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tourStep?: string;
}

export const FEATURE_UPDATES: FeatureUpdate[] = [
  // v2.1.0 - Current Release (November 2025)
  {
    version: '2.1.0',
    date: '2025-11-29',
    title: 'Community Insights',
    description: 'See how your savings compare to other $ave+ users with similar goals and get tips from top savers.',
    icon: Users,
    tourStep: 'peer-insights',
  },
  {
    version: '2.1.0',
    date: '2025-11-29',
    title: 'Journey Milestones',
    description: 'Track your financial journey with unlockable milestones and celebrate your progress along the way.',
    icon: Map,
    tourStep: 'journey-milestones',
  },
  {
    version: '2.1.0',
    date: '2025-11-29',
    title: 'Financial Skills',
    description: 'Level up your financial abilities! Track skill progress and unlock advanced features as you grow.',
    icon: Trophy,
    tourStep: 'skill-tree',
  },
  {
    version: '2.1.0',
    date: '2025-11-29',
    title: 'Weekly Challenges',
    description: 'Join community challenges to boost your savings with friendly competition and earn rewards.',
    icon: Flame,
    tourStep: 'weekly-challenges',
  },
  {
    version: '2.1.0',
    date: '2025-11-29',
    title: 'Anomaly Detection',
    description: 'AI-powered alerts notify you of unusual spending patterns or suspicious bill changes instantly.',
    icon: AlertTriangle,
    tourStep: 'anomaly-alerts',
  },
  {
    version: '2.1.0',
    date: '2025-11-29',
    title: 'Portfolio Overview',
    description: 'Track your investment performance at a glance with real-time gains, losses, and market changes.',
    icon: Briefcase,
    tourStep: 'portfolio-widget',
  },

  // v2.0.0 - January 2025
  {
    version: '2.0.0',
    date: '2025-01-15',
    title: 'Natural Language Queries',
    description: 'Ask anything about your finances in plain English! Try "Show me coffee spending".',
    icon: MessageSquare,
    tourStep: 'nlq-commander',
  },
  {
    version: '2.0.0',
    date: '2025-01-15',
    title: 'Smart Action Chips',
    description: 'AI-powered suggestions appear based on your spending patterns and financial priorities.',
    icon: Sparkles,
    tourStep: 'smart-actions',
  },
  {
    version: '2.0.0',
    date: '2025-01-15',
    title: 'Generative Widget Grid',
    description: 'Drag and reorder widgets. The AI automatically prioritizes urgent items with pulsing borders.',
    icon: LayoutGrid,
    tourStep: 'widget-grid',
  },
  {
    version: '2.0.0',
    date: '2025-01-15',
    title: 'Urgency Animations',
    description: 'Bills due soon now pulse amber and expand to grab your attention before due dates.',
    icon: Bell,
    tourStep: 'upcoming-bills',
  },
  {
    version: '2.0.0',
    date: '2025-01-15',
    title: 'Daily AI Briefing',
    description: 'Your personal AI assistant greets you with a customized financial summary each day.',
    icon: Brain,
    tourStep: 'daily-briefing',
  },
  {
    version: '2.0.0',
    date: '2025-01-15',
    title: 'Contextual Help',
    description: 'Hover over the (?) icon on any widget to learn how it works and get pro tips.',
    icon: Target,
  },

  // v1.9.0 - December 2024
  {
    version: '1.9.0',
    date: '2024-12-01',
    title: 'Cash Flow Forecasting',
    description: '30-day prediction of your balance based on spending patterns and scheduled transactions.',
    icon: TrendingUp,
    tourStep: 'cashflow',
  },
  {
    version: '1.9.0',
    date: '2024-12-01',
    title: 'Smart Pots',
    description: 'Organize savings into dedicated pots with custom icons, goals, and automation rules.',
    icon: Wallet,
  },
  {
    version: '1.9.0',
    date: '2024-12-01',
    title: 'Enhanced Security',
    description: 'Two-factor authentication and biometric login for maximum account protection.',
    icon: Shield,
  },

  // v1.8.0 - November 2024
  {
    version: '1.8.0',
    date: '2024-11-15',
    title: 'Automated Savings Rules',
    description: 'Set up round-ups, scheduled transfers, and trigger-based savings that work automatically.',
    icon: Zap,
  },
  {
    version: '1.8.0',
    date: '2024-11-15',
    title: 'Budget Categories',
    description: 'Create custom budget categories with spending limits and real-time tracking.',
    icon: PieChart,
  },
  {
    version: '1.8.0',
    date: '2024-11-15',
    title: 'Family Sharing',
    description: 'Share goals and budgets with family members. Perfect for household finances.',
    icon: Users,
  },
];

/**
 * Get all features for a specific version
 */
export function getFeaturesByVersion(version: string): FeatureUpdate[] {
  return FEATURE_UPDATES.filter(f => f.version === version);
}

/**
 * Get all unique versions sorted descending
 */
export function getAllVersions(): string[] {
  const versions = [...new Set(FEATURE_UPDATES.map(f => f.version))];
  return versions.sort((a, b) => b.localeCompare(a));
}

export function useWhatsNew() {
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [seenVersion, setSeenVersion] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(WHATS_NEW_VERSION_KEY);
    setSeenVersion(stored);

    // Show modal if user hasn't seen current version
    if (stored !== CURRENT_VERSION) {
      // Small delay to let dashboard render first
      const timer = setTimeout(() => setShowWhatsNew(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissWhatsNew = () => {
    setShowWhatsNew(false);
    localStorage.setItem(WHATS_NEW_VERSION_KEY, CURRENT_VERSION);
    setSeenVersion(CURRENT_VERSION);
  };

  const openWhatsNew = () => {
    setShowWhatsNew(true);
  };

  const hasNewUpdates = seenVersion !== CURRENT_VERSION;

  // Get updates for current version
  const currentUpdates = FEATURE_UPDATES.filter(f => f.version === CURRENT_VERSION);

  return {
    showWhatsNew,
    dismissWhatsNew,
    openWhatsNew,
    hasNewUpdates,
    currentUpdates,
    currentVersion: CURRENT_VERSION,
  };
}
