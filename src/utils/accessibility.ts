/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Announce a message to screen readers
 * @param message - The message to announce
 * @param priority - The priority level (polite or assertive)
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  
  return true;
}

/**
 * Trap focus within a container (useful for modals)
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  return () => container.removeEventListener('keydown', handleTabKey);
}

/**
 * Get ARIA label for a budget percentage
 */
export function getBudgetAriaLabel(
  name: string,
  spent: number,
  limit: number,
  percentage: number
): string {
  const status = percentage >= 100 ? 'over budget' : 
                 percentage >= 80 ? 'near limit' : 'on track';
  
  return `${name} budget: ${spent} dollars spent of ${limit} dollars limit, ${percentage.toFixed(0)} percent used, ${status}`;
}

/**
 * Format currency for screen readers
 */
export function formatCurrencyForScreenReader(amount: number): string {
  return `${amount.toFixed(2)} dollars`;
}

/**
 * Generate unique IDs for accessibility
 */
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`;
}
