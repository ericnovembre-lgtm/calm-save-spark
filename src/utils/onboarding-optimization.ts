/**
 * Utility functions for onboarding optimization
 * Handles prefetching, caching, and resource management
 */

/**
 * Prefetch next step resources
 * Preloads images, videos, and other assets for the next step
 */
export const prefetchStepResources = (stepName: string) => {
  const resourceMap: Record<string, string[]> = {
    'welcome': ['/animations/saveplus-hero-optimized.json'],
    'account-setup': [],
    'first-goal': ['/animations/piggy-bank.json'],
    'automation': ['/videos/automation-demo.mp4'],
    'complete': ['/animations/celebration.json'],
  };

  const resources = resourceMap[stepName] || [];

  resources.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Debounce function for form inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if device has good performance
 * Used to enable/disable heavy animations
 */
export const hasGoodPerformance = (): boolean => {
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  
  // Check memory (if available)
  const memory = (performance as any).memory?.jsHeapSizeLimit || 0;
  const memoryGB = memory / (1024 ** 3);

  // Check connection speed (if available)
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';

  return cores >= 4 && memoryGB >= 2 && effectiveType !== 'slow-2g';
};

/**
 * Lazy load images with Intersection Observer
 */
export const setupLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

/**
 * Optimize animation frame rate based on device performance
 */
export const getOptimalFrameRate = (): number => {
  const performance = hasGoodPerformance();
  return performance ? 60 : 30;
};

/**
 * Cache management for form data
 */
const CACHE_KEY = 'onboarding_form_cache';

export const cacheFormData = (data: Record<string, any>) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache form data:', error);
  }
};

export const getCachedFormData = (): Record<string, any> | null => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to retrieve cached form data:', error);
    return null;
  }
};

export const clearFormCache = () => {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear form cache:', error);
  }
};

/**
 * Detect slow device and adjust experience
 */
export const detectSlowDevice = (): boolean => {
  const start = performance.now();
  
  // Perform a small benchmark
  let sum = 0;
  for (let i = 0; i < 100000; i++) {
    sum += Math.sqrt(i);
  }
  
  const duration = performance.now() - start;
  
  // If simple calculation takes > 10ms, device is slow
  return duration > 10;
};
