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

// Phase 1 Additional: AI Intelligence
export const LazyDocumentIntelligence = lazy(() =>
  import('./ai/DocumentIntelligence').then(m => ({ default: m.DocumentIntelligence }))
);

export const LazyConversationalAnalyst = lazy(() =>
  import('./ai/ConversationalAnalyst').then(m => ({ default: m.ConversationalAnalyst }))
);

export const LazyFinancialMoodTracker = lazy(() =>
  import('./ai/FinancialMoodTracker').then(m => ({ default: m.FinancialMoodTracker }))
);

export const LazyAnomalyDetector = lazy(() =>
  import('./ai/AnomalyDetector').then(m => ({ default: m.AnomalyDetector }))
);

export const LazyPredictiveBehavior = lazy(() =>
  import('./ai/PredictiveBehavior').then(m => ({ default: m.PredictiveBehavior }))
);

export const LazyStoryGenerator = lazy(() =>
  import('./ai/StoryGenerator').then(m => ({ default: m.StoryGenerator }))
);

export const LazyCategoryClassifier = lazy(() =>
  import('./ai/CategoryClassifier').then(m => ({ default: m.CategoryClassifier }))
);

export const LazyGoalSuccessPredictor = lazy(() =>
  import('./ai/GoalSuccessPredictor').then(m => ({ default: m.GoalSuccessPredictor }))
);

// Phase 2 Additional: 3D
export const LazyHolographicLayers = lazy(() =>
  import('./3d/HolographicLayers').then(m => ({ default: m.HolographicLayers }))
);

export const LazyNeuralNetworkViz = lazy(() =>
  import('./3d/NeuralNetworkViz').then(m => ({ default: m.NeuralNetworkViz }))
);

export const LazyFinancialWeather = lazy(() =>
  import('./3d/FinancialWeather').then(m => ({ default: m.FinancialWeather }))
);

export const LazyQuantumParticleField = lazy(() =>
  import('./3d/QuantumParticleField').then(m => ({ default: m.QuantumParticleField }))
);

// Phase 3: Generative Design
export const LazyProceduralArt = lazy(() =>
  import('./effects/ProceduralArt').then(m => ({ default: m.ProceduralArt }))
);

export const LazyGenerativeTheme = lazy(() =>
  import('./effects/GenerativeTheme').then(m => ({ default: m.GenerativeTheme }))
);

// Phase 6 Additional: Gamification
export const LazyAIDailyChallenges = lazy(() =>
  import('./gamification/AIDailyChallenges').then(m => ({ default: m.AIDailyChallenges }))
);

// Phase 9: Immersive
export const LazyTimeMachine = lazy(() =>
  import('./immersive/TimeMachine').then(m => ({ default: m.TimeMachine }))
);

// Phase 10: Performance
export const LazyAIOptimizer = lazy(() =>
  import('./performance/AIOptimizer').then(m => ({ default: m.AIOptimizer }))
);

export const LazyAccessibilityAI = lazy(() =>
  import('./accessibility/AccessibilityAI').then(m => ({ default: m.AccessibilityAI }))
);
