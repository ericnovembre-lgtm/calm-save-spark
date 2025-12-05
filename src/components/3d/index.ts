/**
 * 3D Components Barrel Export
 * Phase 8: Performance Optimizations
 * 
 * Lazy-loads all Three.js components with GPU detection fallbacks
 */

import { lazy } from 'react';
import { withLazy3D } from '@/components/performance/Lazy3D';

// ============================================================
// Dashboard 3D Components (using withLazy3D for auto GPU detection)
// ============================================================

export const LazyBalanceSphere = withLazy3D(
  () => import('@/components/dashboard/3d/BalanceSphere').then(m => ({ default: m.BalanceSphere })),
  { height: '200px' }
);

export const LazyFinancialUniverse = withLazy3D(
  () => import('@/components/dashboard/3d/FinancialUniverse').then(m => ({ default: m.FinancialUniverse })),
  { height: '300px' }
);

export const LazyHolographicLayers = withLazy3D(
  () => import('@/components/dashboard/3d/HolographicLayers').then(m => ({ default: m.HolographicLayers })),
  { height: '250px' }
);

export const LazyNeuralNetworkViz = withLazy3D(
  () => import('@/components/dashboard/3d/NeuralNetworkViz').then(m => ({ default: m.NeuralNetworkViz })),
  { height: '200px' }
);

export const LazyQuantumParticleField = withLazy3D(
  () => import('@/components/dashboard/3d/QuantumParticleField').then(m => ({ default: m.QuantumParticleField })),
  { height: '300px' }
);

// ============================================================
// Coach 3D Components
// ============================================================

export const LazyFinancialDNAOrb = withLazy3D(
  () => import('@/components/coach/FinancialDNAOrb').then(m => ({ default: m.FinancialDNAOrb })),
  { height: '300px' }
);

export const LazyOrbFullscreenModal = withLazy3D(
  () => import('@/components/coach/OrbFullscreenModal').then(m => ({ default: m.OrbFullscreenModal })),
  { height: '100vh' }
);

// ============================================================
// Digital Twin 3D Components
// ============================================================

export const LazyHolographicAvatar = withLazy3D(
  () => import('@/components/digital-twin/HolographicAvatar').then(m => ({ default: m.HolographicAvatar })),
  { height: '400px' }
);

// ============================================================
// Guardian 3D Components
// ============================================================

export const LazyAegisShield = withLazy3D(
  () => import('@/components/guardian/AegisShield').then(m => ({ default: m.AegisShield })),
  { height: '300px' }
);

// ============================================================
// Financial Health 3D Components
// ============================================================

export const LazyHolographicHealthGlobe = withLazy3D(
  () => import('@/components/financial-health/HolographicHealthGlobe').then(m => ({ default: m.HolographicHealthGlobe })),
  { height: '300px' }
);

// ============================================================
// Pricing 3D Components
// ============================================================

export const LazyPricing3DDisc = withLazy3D(
  () => import('@/components/pricing/hero/Pricing3DDisc').then(m => ({ default: m.Pricing3DDisc })),
  { height: '400px' }
);

// ============================================================
// Hubs 3D Components
// ============================================================

export const LazyFeatureUniverse3D = withLazy3D(
  () => import('@/components/hubs/money/3d/FeatureUniverse3D').then(m => ({ default: m.FeatureUniverse3D })),
  { height: '300px' }
);

// ============================================================
// Dashboard AI 3D Components
// ============================================================

export const LazyNeuralBalanceForecast = withLazy3D(
  () => import('@/components/dashboard/ai/NeuralBalanceForecast').then(m => ({ default: m.NeuralBalanceForecast })),
  { height: '250px' }
);

// ============================================================
// Direct lazy imports (for components that need props)
// ============================================================

export const BalanceSphere = lazy(() => 
  import('@/components/dashboard/3d/BalanceSphere').then(m => ({ default: m.BalanceSphere }))
);
export const FinancialUniverse = lazy(() => 
  import('@/components/dashboard/3d/FinancialUniverse').then(m => ({ default: m.FinancialUniverse }))
);
export const HolographicLayers = lazy(() => 
  import('@/components/dashboard/3d/HolographicLayers').then(m => ({ default: m.HolographicLayers }))
);
export const NeuralNetworkViz = lazy(() => 
  import('@/components/dashboard/3d/NeuralNetworkViz').then(m => ({ default: m.NeuralNetworkViz }))
);
export const QuantumParticleField = lazy(() => 
  import('@/components/dashboard/3d/QuantumParticleField').then(m => ({ default: m.QuantumParticleField }))
);
export const FinancialDNAOrb = lazy(() => 
  import('@/components/coach/FinancialDNAOrb').then(m => ({ default: m.FinancialDNAOrb }))
);
export const OrbFullscreenModal = lazy(() => 
  import('@/components/coach/OrbFullscreenModal').then(m => ({ default: m.OrbFullscreenModal }))
);
export const HolographicAvatar = lazy(() => 
  import('@/components/digital-twin/HolographicAvatar').then(m => ({ default: m.HolographicAvatar }))
);
export const AegisShield = lazy(() => 
  import('@/components/guardian/AegisShield').then(m => ({ default: m.AegisShield }))
);
export const HolographicHealthGlobe = lazy(() => 
  import('@/components/financial-health/HolographicHealthGlobe').then(m => ({ default: m.HolographicHealthGlobe }))
);
export const Pricing3DDisc = lazy(() => 
  import('@/components/pricing/hero/Pricing3DDisc').then(m => ({ default: m.Pricing3DDisc }))
);
export const FeatureUniverse3D = lazy(() => 
  import('@/components/hubs/money/3d/FeatureUniverse3D').then(m => ({ default: m.FeatureUniverse3D }))
);
export const NeuralBalanceForecast = lazy(() => 
  import('@/components/dashboard/ai/NeuralBalanceForecast').then(m => ({ default: m.NeuralBalanceForecast }))
);

// ============================================================
// 3D Support Detection
// ============================================================

export { use3DSupport } from '@/components/performance/Lazy3D';

/**
 * Check if device can render 3D content
 */
export function can3DRender(): boolean {
  // Check WebGL support
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return false;
  } catch {
    return false;
  }
  
  // Check device memory (if available)
  const nav = navigator as any;
  if (nav.deviceMemory && nav.deviceMemory < 4) {
    return false;
  }
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  
  return true;
}

/**
 * Get recommended 3D quality level based on device capabilities
 */
export function get3DQualityLevel(): 'high' | 'medium' | 'low' | 'none' {
  if (!can3DRender()) return 'none';
  
  const nav = navigator as any;
  const memory = nav.deviceMemory || 8;
  const cores = nav.hardwareConcurrency || 4;
  
  if (memory >= 8 && cores >= 8) return 'high';
  if (memory >= 4 && cores >= 4) return 'medium';
  return 'low';
}
