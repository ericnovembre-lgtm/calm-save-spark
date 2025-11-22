import { lazy } from 'react';

// Consolidated lazy imports - reduced from 15+ to 8 critical components
export const LazyCalculator = lazy(() => import('./Calculator').then(m => ({ default: m.Calculator })));
export const LazyInteractiveDemo = lazy(() => import('./InteractiveDemo').then(m => ({ default: m.InteractiveDemo })));
export const LazyFAQ = lazy(() => import('./FAQ').then(m => ({ default: m.FAQ })));
export const LazyTestimonials = lazy(() => import('./advanced/Testimonials').then(m => ({ default: m.Testimonials })));
export const LazyPlatformOverview = lazy(() => import('./PlatformOverview').then(m => ({ default: m.PlatformOverview })));

// Effects bundle - lazy loaded together for better performance
export const LazyEffectsBundle = lazy(() => 
  Promise.all([
    import('./advanced/FloatingParticles').then(m => ({ FloatingParticles: m.FloatingParticles })),
    import('./effects/NeuralNetworkBackground').then(m => ({ NeuralNetworkBackground: m.NeuralNetworkBackground })),
    import('./particles/CoinParticleSystem').then(m => ({ CoinParticleSystem: m.CoinParticleSystem })),
  ]).then(([particles, neural, coins]) => ({
    default: () => (
      <>
        <particles.FloatingParticles />
        <neural.NeuralNetworkBackground />
        <coins.CoinParticleSystem />
      </>
    )
  }))
);
