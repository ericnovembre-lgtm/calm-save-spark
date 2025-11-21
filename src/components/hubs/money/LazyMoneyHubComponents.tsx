import { lazy } from 'react';

// Phase 1: AI Intelligence Core
export const LazyAICommandCenter = lazy(() => 
  import('./ai/AICommandCenter').then(m => ({ default: m.AICommandCenter }))
);

export const LazySmartFeatureRecommender = lazy(() => 
  import('./ai/SmartFeatureRecommender').then(m => ({ default: m.SmartFeatureRecommender }))
);

export const LazyHubConversationAssistant = lazy(() => 
  import('./ai/HubConversationAssistant').then(m => ({ default: m.HubConversationAssistant }))
);

// Phase 2: 3D Immersive
export const LazyFeatureUniverse3D = lazy(() => 
  import('./3d/FeatureUniverse3D').then(m => ({ default: m.FeatureUniverse3D }))
);

// Phase 3: Generative Effects
export const LazyLiquidCardMorph = lazy(() => 
  import('./effects/LiquidCardMorph').then(m => ({ default: m.LiquidCardMorph }))
);

export const LazyProceduralHubBackground = lazy(() => 
  import('./effects/ProceduralHubBackground').then(m => ({ default: m.ProceduralHubBackground }))
);

export const LazyMoneyFlowParticles = lazy(() => 
  import('./effects/MoneyFlowParticles').then(m => ({ default: m.MoneyFlowParticles }))
);

// Phase 4: ML Features
export const LazyPredictiveFeatureEngine = lazy(() => 
  import('./ml/PredictiveFeatureEngine').then(m => ({ default: m.PredictiveFeatureEngine }))
);

// Phase 5: Gamification
export const LazyHubAchievements = lazy(() => 
  import('./gamification/HubAchievements').then(m => ({ default: m.HubAchievements }))
);

export const LazyDailyHubQuests = lazy(() => 
  import('./gamification/DailyHubQuests').then(m => ({ default: m.DailyHubQuests }))
);

// Phase 6: Real-time
export const LazyLiveActivityStream = lazy(() => 
  import('./realtime/LiveActivityStream').then(m => ({ default: m.LiveActivityStream }))
);

// Phase 7: Voice
export const LazyVoiceHubControl = lazy(() => 
  import('./voice/VoiceHubControl').then(m => ({ default: m.VoiceHubControl }))
);

// Phase 8: Adaptive
export const LazyAdaptiveComplexity = lazy(() => 
  import('./adaptive/AdaptiveComplexity').then(m => ({ default: m.AdaptiveComplexity }))
);

// Phase 9: Immersive
export const LazyHubTheaterMode = lazy(() => 
  import('./immersive/HubTheaterMode').then(m => ({ default: m.HubTheaterMode }))
);

export const LazyHubTimeMachine = lazy(() => 
  import('./immersive/HubTimeMachine').then(m => ({ default: m.HubTimeMachine }))
);

// Phase 10: Performance
export const LazyHubPerformanceAI = lazy(() => 
  import('./performance/HubPerformanceAI').then(m => ({ default: m.HubPerformanceAI }))
);
