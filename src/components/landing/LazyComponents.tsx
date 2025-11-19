import { lazy } from 'react';

// Lazy load heavy below-the-fold components for better initial load performance
export const LazyCalculator = lazy(() => import('./Calculator').then(m => ({ default: m.Calculator })));
export const LazyInteractiveDemo = lazy(() => import('./InteractiveDemo').then(m => ({ default: m.InteractiveDemo })));
export const LazyFAQ = lazy(() => import('./FAQ').then(m => ({ default: m.FAQ })));
export const LazyFeatureComparison = lazy(() => import('./FeatureComparison').then(m => ({ default: m.FeatureComparison })));
export const LazyIntegrations = lazy(() => import('./Integrations').then(m => ({ default: m.Integrations })));
export const LazyUseCases = lazy(() => import('./UseCases').then(m => ({ default: m.UseCases })));
export const LazyPremiumShowcase = lazy(() => import('./PremiumShowcase').then(m => ({ default: m.PremiumShowcase })));
export const LazySaveplusCoachWidget = lazy(() => import('@/components/coach/SaveplusCoachWidget').then(m => ({ default: m.SaveplusCoachWidget })));
export const LazyFloatingParticles = lazy(() => import('./advanced/FloatingParticles').then(m => ({ default: m.FloatingParticles })));
export const LazyTestimonials = lazy(() => import('./advanced/Testimonials').then(m => ({ default: m.Testimonials })));
export const LazyPlatformOverview = lazy(() => import('./PlatformOverview').then(m => ({ default: m.PlatformOverview })));
