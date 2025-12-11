/**
 * Higher-Order Component for wrapping pages with PageErrorBoundary
 * Makes it easy to add error boundaries to pages
 */
import React, { ComponentType, useEffect } from 'react';
import { PageErrorBoundary } from './PageErrorBoundary';
import { addBreadcrumb } from '@/lib/sentry';

interface WithPageErrorBoundaryOptions {
  fallback?: React.ReactNode;
  onReset?: () => void;
}

/**
 * Wrap a page component with PageErrorBoundary
 * 
 * @example
 * // Basic usage
 * export default withPageErrorBoundary(MyPage, 'MyPage');
 * 
 * // With options
 * export default withPageErrorBoundary(MyPage, 'MyPage', {
 *   fallback: <CustomFallback />,
 *   onReset: () => console.log('Reset triggered'),
 * });
 */
export function withPageErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  pageName: string,
  options?: WithPageErrorBoundaryOptions
): ComponentType<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithErrorBoundary: React.FC<P> = (props) => {
    // Add breadcrumb when page mounts
    useEffect(() => {
      addBreadcrumb(
        `Navigated to ${pageName}`,
        'navigation',
        'info',
        { page: pageName }
      );
    }, []);

    return (
      <PageErrorBoundary 
        pageName={pageName}
        fallback={options?.fallback}
        onReset={options?.onReset}
      >
        <WrappedComponent {...props} />
      </PageErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `withPageErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

export default withPageErrorBoundary;
