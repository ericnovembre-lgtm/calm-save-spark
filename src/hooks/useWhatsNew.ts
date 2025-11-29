import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, LayoutGrid, Bell, Brain, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const WHATS_NEW_VERSION_KEY = 'whats-new-seen-version';
const CURRENT_VERSION = '2.0.0';

export interface FeatureUpdate {
  version: string;
  date: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tourStep?: string;
}

export const FEATURE_UPDATES: FeatureUpdate[] = [
  {
    version: '2.0.0',
    date: '2025-01-15',
    title: 'Natural Language Queries',
    description: 'Ask anything about your finances in plain English! Try "Show me coffee spending" or press ⌘K.',
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
];

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
