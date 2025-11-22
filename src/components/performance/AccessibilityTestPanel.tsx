/**
 * Accessibility Testing Panel
 * Provides quick checks for common accessibility issues
 * Only renders in development mode
 */

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface A11yCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'success';
}

export const AccessibilityTestPanel = () => {
  const [checks, setChecks] = useState<A11yCheck[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (import.meta.env.PROD) return;

    const runA11yChecks = () => {
      const newChecks: A11yCheck[] = [];

      // Check 1: Skip to content link
      const skipLink = document.querySelector('a[href="#main-content"]');
      newChecks.push({
        name: 'Skip to Content Link',
        passed: !!skipLink,
        message: skipLink ? 'Skip link found' : 'Missing skip to content link',
        severity: skipLink ? 'success' : 'error',
      });

      // Check 2: Main landmark
      const mainLandmark = document.querySelector('main#main-content');
      newChecks.push({
        name: 'Main Landmark',
        passed: !!mainLandmark,
        message: mainLandmark ? 'Main landmark with ID found' : 'Missing main landmark',
        severity: mainLandmark ? 'success' : 'error',
      });

      // Check 3: Heading hierarchy
      const h1Count = document.querySelectorAll('h1').length;
      newChecks.push({
        name: 'H1 Heading',
        passed: h1Count === 1,
        message: h1Count === 1 ? 'One H1 found' : `Found ${h1Count} H1s (should be 1)`,
        severity: h1Count === 1 ? 'success' : 'error',
      });

      // Check 4: Images with alt text
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.alt && !img.getAttribute('aria-hidden'));
      newChecks.push({
        name: 'Image Alt Text',
        passed: imagesWithoutAlt.length === 0,
        message: imagesWithoutAlt.length === 0 
          ? 'All images have alt text' 
          : `${imagesWithoutAlt.length} images missing alt text`,
        severity: imagesWithoutAlt.length === 0 ? 'success' : 'warning',
      });

      // Check 5: Buttons with accessible names
      const buttons = document.querySelectorAll('button');
      const buttonsWithoutLabel = Array.from(buttons).filter(btn => {
        return !btn.textContent?.trim() && 
               !btn.getAttribute('aria-label') && 
               !btn.getAttribute('aria-labelledby');
      });
      newChecks.push({
        name: 'Button Labels',
        passed: buttonsWithoutLabel.length === 0,
        message: buttonsWithoutLabel.length === 0 
          ? 'All buttons have labels' 
          : `${buttonsWithoutLabel.length} buttons missing labels`,
        severity: buttonsWithoutLabel.length === 0 ? 'success' : 'error',
      });

      // Check 6: Form inputs with labels
      const inputs = document.querySelectorAll('input:not([type="hidden"])');
      const inputsWithoutLabel = Array.from(inputs).filter(input => {
        const hasLabel = document.querySelector(`label[for="${input.id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label');
        return !hasLabel && !hasAriaLabel;
      });
      newChecks.push({
        name: 'Form Input Labels',
        passed: inputs.length === 0 || inputsWithoutLabel.length === 0,
        message: inputs.length === 0 
          ? 'No form inputs on page' 
          : inputsWithoutLabel.length === 0 
            ? 'All inputs have labels' 
            : `${inputsWithoutLabel.length} inputs missing labels`,
        severity: inputs.length === 0 || inputsWithoutLabel.length === 0 ? 'success' : 'error',
      });

      // Check 7: Focus indicators
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      newChecks.push({
        name: 'Focusable Elements',
        passed: focusableElements.length > 0,
        message: `${focusableElements.length} focusable elements found`,
        severity: 'success',
      });

      // Check 8: ARIA live regions
      const liveRegions = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
      newChecks.push({
        name: 'ARIA Live Regions',
        passed: liveRegions.length > 0,
        message: `${liveRegions.length} live regions for dynamic content`,
        severity: liveRegions.length > 0 ? 'success' : 'warning',
      });

      setChecks(newChecks);
    };

    // Run checks after DOM is ready
    setTimeout(runA11yChecks, 1000);

    // Re-run on significant DOM changes
    const observer = new MutationObserver(() => {
      runA11yChecks();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Don't render in production
  if (import.meta.env.PROD) return null;

  const errorCount = checks.filter(c => c.severity === 'error').length;
  const warningCount = checks.filter(c => c.severity === 'warning').length;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label="Toggle accessibility test panel"
      >
        A11y Tests
        {errorCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
            {errorCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-[600px] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Accessibility Checks
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <span className="text-green-600 dark:text-green-400">
                ✓ {checks.filter(c => c.severity === 'success').length} Passed
              </span>
              {warningCount > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400">
                  ⚠ {warningCount} Warnings
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  ✕ {errorCount} Errors
                </span>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3">
            {checks.map((check, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  check.severity === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : check.severity === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {check.severity === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  ) : check.severity === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {check.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {check.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              💡 This panel only shows in development. Run Lighthouse for comprehensive testing.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
