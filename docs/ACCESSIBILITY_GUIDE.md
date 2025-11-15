# Accessibility Guide - Smart Budgets

## Overview
This guide outlines the accessibility features and best practices implemented in the Smart Budgets feature to ensure WCAG 2.1 AA compliance.

---

## Core Principles

### 1. Perceivable
Information and UI components must be presentable to users in ways they can perceive.

#### Color & Contrast
- ✅ All text maintains 4.5:1 contrast ratio minimum
- ✅ Interactive elements have 3:1 contrast ratio
- ✅ Visual indicators don't rely solely on color
- ✅ Budget status uses icons + color + text

#### Alternative Text
- ✅ All images have descriptive alt text
- ✅ Icons include `aria-label` attributes
- ✅ Charts provide text alternatives

### 2. Operable
UI components and navigation must be operable.

#### Keyboard Navigation
- ✅ All interactive elements accessible via keyboard
- ✅ Logical tab order throughout the application
- ✅ Focus indicators visible on all elements
- ✅ No keyboard traps in modals or wizards

#### Focus Management
```typescript
// Example: Focus trap in modals
import { trapFocus } from '@/utils/accessibility';

useEffect(() => {
  if (isOpen && modalRef.current) {
    const cleanup = trapFocus(modalRef.current);
    return cleanup;
  }
}, [isOpen]);
```

### 3. Understandable
Information and operation of UI must be understandable.

#### Screen Reader Support
- ✅ Semantic HTML elements used throughout
- ✅ ARIA labels for complex components
- ✅ Live regions for dynamic content updates
- ✅ Clear error messages and instructions

#### Consistent Navigation
- ✅ Predictable navigation structure
- ✅ Consistent component behavior
- ✅ Clear headings hierarchy

### 4. Robust
Content must be robust enough to be interpreted by assistive technologies.

#### Valid HTML
- ✅ Semantic HTML5 elements
- ✅ Valid ARIA attributes
- ✅ Proper nesting and structure

---

## Component-Specific Guidelines

### BudgetCard

#### ARIA Labels
```typescript
<div 
  role="article"
  aria-labelledby={`budget-${id}-title`}
  aria-describedby={`budget-${id}-status`}
>
  <h3 id={`budget-${id}-title`}>{name}</h3>
  <p id={`budget-${id}-status`}>
    {getBudgetAriaLabel(name, spent, limit, percentage)}
  </p>
</div>
```

#### Keyboard Actions
- `Enter` or `Space`: Open budget details
- `Tab`: Navigate to next action
- `Shift + Tab`: Navigate to previous action

### CreateBudgetWizard

#### Step Navigation
- ✅ Current step announced to screen readers
- ✅ Progress indicator accessible
- ✅ Validation errors announced

```typescript
<div role="dialog" aria-labelledby="wizard-title" aria-modal="true">
  <h2 id="wizard-title">Create Budget - Step {currentStep} of {totalSteps}</h2>
  <div aria-live="polite" aria-atomic="true">
    {validationError && <p role="alert">{validationError}</p>}
  </div>
</div>
```

#### Form Fields
- ✅ All inputs have associated labels
- ✅ Required fields marked with `aria-required`
- ✅ Error states use `aria-invalid` and `aria-describedby`

### EnhancedBudgetAnalytics

#### Charts
- ✅ Alternative text descriptions
- ✅ Data tables as fallback
- ✅ Keyboard navigation for interactive elements

```typescript
<div role="img" aria-label="Budget spending trends chart">
  <ResponsiveContainer>
    <LineChart data={data}>
      {/* Chart content */}
    </LineChart>
  </ResponsiveContainer>
  
  {/* Fallback table */}
  <table className="sr-only">
    <caption>Budget spending data</caption>
    {/* Table content */}
  </table>
</div>
```

### AICoachPanel

#### Dynamic Content
```typescript
// Announce AI advice to screen readers
import { announce } from '@/utils/accessibility';

useEffect(() => {
  if (advice) {
    announce(`Budget advice received: ${advice}`, 'polite');
  }
}, [advice]);
```

---

## Utility Functions

### Screen Reader Announcements
```typescript
/**
 * Announce messages to screen readers
 */
export function announce(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Usage
announce('Budget created successfully', 'polite');
announce('Budget limit exceeded!', 'assertive');
```

### Focus Management
```typescript
/**
 * Trap focus within a container
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  // Implementation...
}
```

### ARIA Labels
```typescript
/**
 * Generate descriptive ARIA label for budgets
 */
export function getBudgetAriaLabel(
  name: string,
  spent: number,
  limit: number,
  percentage: number
): string {
  const status = percentage >= 100 ? 'over budget' : 
                 percentage >= 80 ? 'near limit' : 'on track';
  
  return `${name} budget: ${spent} dollars spent of ${limit} dollars limit, ${percentage} percent used, ${status}`;
}
```

---

## Testing Checklist

### Manual Testing
- [ ] Navigate entire budget flow using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Verify focus indicators are visible
- [ ] Check color contrast with browser tools
- [ ] Test with 200% zoom
- [ ] Verify form validation messages are announced

### Automated Testing
```bash
# Run accessibility tests
npm run test:a11y

# Check for WCAG violations
npm run audit:a11y
```

### Screen Reader Testing Commands

#### NVDA (Windows)
- `NVDA + Down Arrow`: Read next item
- `Insert + F7`: Elements list
- `H`: Next heading
- `F`: Next form field

#### VoiceOver (Mac)
- `VO + Right Arrow`: Navigate forward
- `VO + U`: Rotor menu
- `VO + Command + H`: Next heading
- `VO + Command + J`: Next form control

---

## Common Patterns

### Loading States
```typescript
<div role="status" aria-live="polite" aria-busy={loading}>
  {loading ? (
    <>
      <span className="sr-only">Loading budget data...</span>
      <LoadingSpinner />
    </>
  ) : (
    <BudgetContent />
  )}
</div>
```

### Error Messages
```typescript
<div role="alert" aria-live="assertive">
  <AlertTriangle aria-hidden="true" />
  <span>{error.message}</span>
</div>
```

### Success Messages
```typescript
<div role="status" aria-live="polite">
  <Check aria-hidden="true" />
  <span>Budget saved successfully</span>
</div>
```

### Interactive Buttons
```typescript
<button
  type="button"
  aria-label={`Delete ${budgetName} budget`}
  aria-describedby="delete-warning"
>
  <Trash2 aria-hidden="true" />
</button>
<div id="delete-warning" className="sr-only">
  This action cannot be undone
</div>
```

---

## Reduced Motion Support

### Respecting User Preferences
```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<motion.div
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.3
  }}
>
  {content}
</motion.div>
```

### CSS Media Query
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Resources

### Tools
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Standards
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

---

## Support

For accessibility issues or questions:
1. Check this guide first
2. Review component-specific documentation
3. Test with assistive technologies
4. Consult WCAG 2.1 guidelines

---

Last Updated: 2025-01-15
