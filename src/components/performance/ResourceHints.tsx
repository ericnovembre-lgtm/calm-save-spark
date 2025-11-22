import { Helmet } from "react-helmet";

/**
 * Resource Hints Component
 * Provides performance optimizations through resource hints
 * - Preconnect: Early connection to important origins
 * - DNS Prefetch: Early DNS resolution
 * - Preload: High-priority resources needed for current page
 * - Prefetch: Low-priority resources for future navigation
 */
export const ResourceHints = () => {
  return (
    <Helmet>
      {/* Preconnect to important third-party origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch for additional origins */}
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      
      {/* Preload critical fonts */}
      <link 
        rel="preload" 
        href="/fonts/inter-var.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
      
      {/* Prefetch images for below-fold content */}
      <link rel="prefetch" href="/images/features-preview.webp" as="image" />
      <link rel="prefetch" href="/images/dashboard-preview.webp" as="image" />
    </Helmet>
  );
};
