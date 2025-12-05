import { useCallback, useId, useMemo } from 'react';
import { useScreenReaderAnnounce } from './useScreenReaderAnnounce';

interface FieldConfig {
  /** Field name/key */
  name: string;
  /** Human-readable label */
  label: string;
  /** Whether field is required */
  required?: boolean;
  /** Current error message */
  error?: string;
  /** Field description/help text */
  description?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Current value length (for character count) */
  currentLength?: number;
}

interface FieldAccessibilityProps {
  /** ID for the input element */
  id: string;
  /** ID for the label element */
  labelId: string;
  /** ID for the error message element */
  errorId: string;
  /** ID for the description element */
  descriptionId: string;
  /** aria-invalid attribute */
  'aria-invalid': boolean;
  /** aria-required attribute */
  'aria-required': boolean | undefined;
  /** aria-describedby combining error and description */
  'aria-describedby': string | undefined;
  /** aria-errormessage for error association */
  'aria-errormessage': string | undefined;
}

interface UseFormAccessibilityOptions {
  /** Form ID prefix */
  formId?: string;
  /** Announce errors to screen readers */
  announceErrors?: boolean;
  /** Announce on form submission */
  announceOnSubmit?: boolean;
}

interface UseFormAccessibilityReturn {
  /** Get accessibility props for a field */
  getFieldProps: (config: FieldConfig) => FieldAccessibilityProps;
  /** Announce form validation errors */
  announceErrors: (errors: Record<string, string>) => void;
  /** Announce form submission status */
  announceSubmitStatus: (success: boolean, message?: string) => void;
  /** Get error summary for screen readers */
  getErrorSummary: (errors: Record<string, string>) => string;
  /** Generate character count announcement */
  getCharacterCountAnnouncement: (current: number, max: number) => string;
  /** Props for form element */
  formProps: {
    'aria-label'?: string;
    noValidate: boolean;
  };
}

/**
 * Hook for comprehensive form accessibility support.
 * Handles label associations, error announcements, and ARIA attributes.
 */
export function useFormAccessibility({
  formId,
  announceErrors: shouldAnnounceErrors = true,
  announceOnSubmit = true,
}: UseFormAccessibilityOptions = {}): UseFormAccessibilityReturn {
  const generatedId = useId();
  const baseId = formId || generatedId;
  const { announce, announceError, announceSuccess } = useScreenReaderAnnounce();

  const getFieldProps = useCallback((config: FieldConfig): FieldAccessibilityProps => {
    const { name, required, error, description } = config;
    const fieldId = `${baseId}-${name}`;
    const labelId = `${fieldId}-label`;
    const errorId = `${fieldId}-error`;
    const descriptionId = `${fieldId}-description`;

    // Build aria-describedby from available elements
    const describedByParts: string[] = [];
    if (error) describedByParts.push(errorId);
    if (description) describedByParts.push(descriptionId);

    return {
      id: fieldId,
      labelId,
      errorId,
      descriptionId,
      'aria-invalid': !!error,
      'aria-required': required || undefined,
      'aria-describedby': describedByParts.length > 0 ? describedByParts.join(' ') : undefined,
      'aria-errormessage': error ? errorId : undefined,
    };
  }, [baseId]);

  const announceFormErrors = useCallback((errors: Record<string, string>) => {
    if (!shouldAnnounceErrors) return;

    const errorCount = Object.keys(errors).length;
    if (errorCount === 0) return;

    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join('. ');

    const announcement = errorCount === 1
      ? `Form error: ${errorMessages}`
      : `${errorCount} form errors. ${errorMessages}`;

    announceError(announcement);
  }, [shouldAnnounceErrors, announceError]);

  const announceSubmitStatus = useCallback((success: boolean, message?: string) => {
    if (!announceOnSubmit) return;

    const defaultMessage = success
      ? 'Form submitted successfully'
      : 'Form submission failed. Please check for errors.';

    if (success) {
      announceSuccess(message || defaultMessage);
    } else {
      announceError(message || defaultMessage);
    }
  }, [announceOnSubmit, announceError, announceSuccess]);

  const getErrorSummary = useCallback((errors: Record<string, string>): string => {
    const errorEntries = Object.entries(errors);
    if (errorEntries.length === 0) return '';

    const errorList = errorEntries
      .map(([field, message]) => `${field}: ${message}`)
      .join('; ');

    return `${errorEntries.length} error${errorEntries.length > 1 ? 's' : ''}: ${errorList}`;
  }, []);

  const getCharacterCountAnnouncement = useCallback((current: number, max: number): string => {
    const remaining = max - current;
    
    if (remaining <= 0) {
      return `Character limit reached. ${max} of ${max} characters used.`;
    }
    
    if (remaining <= 10) {
      return `${remaining} character${remaining === 1 ? '' : 's'} remaining.`;
    }
    
    // Only announce at certain thresholds to avoid spam
    if (current === 0 || remaining === Math.floor(max * 0.25) || remaining === Math.floor(max * 0.1)) {
      return `${current} of ${max} characters used.`;
    }
    
    return '';
  }, []);

  const formProps = useMemo(() => ({
    noValidate: true, // Use custom validation with proper announcements
  }), []);

  return {
    getFieldProps,
    announceErrors: announceFormErrors,
    announceSubmitStatus,
    getErrorSummary,
    getCharacterCountAnnouncement,
    formProps,
  };
}
