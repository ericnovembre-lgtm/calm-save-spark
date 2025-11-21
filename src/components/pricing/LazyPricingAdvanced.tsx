import { lazy } from 'react';

// Phase 1: Intelligent Hero
export const LazyAIPriceRecommender = lazy(() =>
  import('./ai/AIPriceRecommender').then(m => ({ default: m.AIPriceRecommender }))
);

export const LazyPricing3DDisc = lazy(() =>
  import('./hero/Pricing3DDisc').then(m => ({ default: m.Pricing3DDisc }))
);

export const LazyHolographicValueCard = lazy(() =>
  import('./hero/HolographicValueCard').then(m => ({ default: m.HolographicValueCard }))
);

export const LazyLiveSavingsCounter = lazy(() =>
  import('./hero/LiveSavingsCounter').then(m => ({ default: m.LiveSavingsCounter }))
);

// Phase 2: Interactive Calculators
export const LazyAIROICalculator = lazy(() =>
  import('./interactive/AIROICalculator').then(m => ({ default: m.AIROICalculator }))
);

export const LazyFeatureComparisonMatrix = lazy(() =>
  import('./interactive/FeatureComparisonMatrix').then(m => ({ default: m.FeatureComparisonMatrix }))
);

export const LazyTierJourneyMap = lazy(() =>
  import('./interactive/TierJourneyMap').then(m => ({ default: m.TierJourneyMap }))
);

export const LazyGamifiedSavingsSimulator = lazy(() =>
  import('./interactive/GamifiedSavingsSimulator').then(m => ({ default: m.GamifiedSavingsSimulator }))
);

// Phase 3: Effects
export const LazyPricingConstellation = lazy(() =>
  import('./effects/PricingConstellation').then(m => ({ default: m.PricingConstellation }))
);

// Phase 4: AI Components
export const LazyPricingChatbot = lazy(() =>
  import('./ai/PricingChatbot').then(m => ({ default: m.PricingChatbot }))
);

// Phase 7: Gamification
export const LazyAchievementBadges = lazy(() =>
  import('./gamification/AchievementBadges').then(m => ({ default: m.AchievementBadges }))
);

// Phase 8: Social Proof
export const LazyRealTimeActivityFeed = lazy(() =>
  import('./social/RealTimeActivityFeed').then(m => ({ default: m.RealTimeActivityFeed }))
);
