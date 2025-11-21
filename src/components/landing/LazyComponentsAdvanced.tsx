import { lazy } from 'react';

// Phase 1: Hero Components
export const LazyFinancial3DUniverse = lazy(() => 
  import('./hero/Financial3DUniverse').then(m => ({ default: m.Financial3DUniverse }))
);

export const LazyAIPersonalizedHero = lazy(() => 
  import('./hero/AIPersonalizedHero').then(m => ({ default: m.AIPersonalizedHero }))
);

export const LazyLiveDashboardPreview = lazy(() => 
  import('./hero/LiveDashboardPreview').then(m => ({ default: m.LiveDashboardPreview }))
);

// Phase 2: Interactive Features
export const LazyAISavingsSimulator = lazy(() => 
  import('./interactive/AISavingsSimulator').then(m => ({ default: m.AISavingsSimulator }))
);

// Phase 3: Effects
export const LazyNeuralNetworkBackground = lazy(() => 
  import('./effects/NeuralNetworkBackground').then(m => ({ default: m.NeuralNetworkBackground }))
);

export const LazyMagneticCursor = lazy(() => 
  import('./effects/MagneticCursor').then(m => ({ default: m.MagneticCursor }))
);

// Phase 4: AI Components
export const LazyLiveSocialProofStream = lazy(() => 
  import('./ai/LiveSocialProofStream').then(m => ({ default: m.LiveSocialProofStream }))
);

// Phase 5: Particles
export const LazyCoinParticleSystem = lazy(() => 
  import('./particles/CoinParticleSystem').then(m => ({ default: m.CoinParticleSystem }))
);

// Phase 6: Visualizations
export const LazyLiquidFillGauge = lazy(() => 
  import('./visualizations/LiquidFillGauge').then(m => ({ default: m.LiquidFillGauge }))
);

export const LazyInteractiveTimeline = lazy(() => 
  import('./visualizations/InteractiveTimeline').then(m => ({ default: m.InteractiveTimeline }))
);
