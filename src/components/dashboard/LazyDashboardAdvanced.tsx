import { lazy } from 'react';

// Phase 1: AI-Powered Core
export const LazyIntelligentLayoutEngine = lazy(() =>
  import('./ai/IntelligentLayoutEngine').then(m => ({ default: m.IntelligentLayoutEngine }))
);

export const LazyNeuralBalanceForecast = lazy(() =>
  import('./ai/NeuralBalanceForecast').then(m => ({ default: m.NeuralBalanceForecast }))
);

export const LazyContextualAIAssistant = lazy(() =>
  import('./ai/ContextualAIAssistant').then(m => ({ default: m.ContextualAIAssistant }))
);

export const LazySmartWidgetRecommender = lazy(() =>
  import('./ai/SmartWidgetRecommender').then(m => ({ default: m.SmartWidgetRecommender }))
);

// Phase 2: 3D Visualizations
export const LazyBalanceSphere = lazy(() =>
  import('./3d/BalanceSphere').then(m => ({ default: m.BalanceSphere }))
);

export const LazyFinancialUniverse = lazy(() =>
  import('./3d/FinancialUniverse').then(m => ({ default: m.FinancialUniverse }))
);

// Phase 4: Effects
export const LazyDynamicParticleSystem = lazy(() =>
  import('./effects/DynamicParticleSystem').then(m => ({ default: m.DynamicParticleSystem }))
);

export const LazyGenerativeBackground = lazy(() =>
  import('./effects/GenerativeBackground').then(m => ({ default: m.GenerativeBackground }))
);

// Phase 5: Real-time
export const LazyLiveActivityFeed = lazy(() =>
  import('./realtime/LiveActivityFeed').then(m => ({ default: m.LiveActivityFeed }))
);

// Phase 6: Gamification
export const LazyDailyQuestSystem = lazy(() =>
  import('./gamification/DailyQuestSystem').then(m => ({ default: m.DailyQuestSystem }))
);

export const LazyCompetitiveLeaderboards = lazy(() =>
  import('./gamification/CompetitiveLeaderboards').then(m => ({ default: m.CompetitiveLeaderboards }))
);

// Phase 7: Voice
export const LazyVoiceCommandSystem = lazy(() =>
  import('./voice/VoiceCommandSystem').then(m => ({ default: m.VoiceCommandSystem }))
);
