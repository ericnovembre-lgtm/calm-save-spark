import { ReactNode, useId } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from './VisuallyHidden';

interface FormFieldWrapperProps {
  children: ReactNode;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  /** Hide label visually but keep it accessible */
  hideLabel?: boolean;
  className?: string;
  /** Maximum character count for inputs */
  maxLength?: number;
  /** Current character count */
  currentLength?: number;
}

/**
 * Accessible form field wrapper
 * Automatically handles label associations, errors, and descriptions
 */
export function FormFieldWrapper({
  children,
  label,
  description,
  error,
  required = false,
  hideLabel = false,
  className,
  maxLength,
  currentLength,
}: FormFieldWrapperProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const countId = maxLength !== undefined ? `${id}-count` : undefined;

  // Get aria-describedby IDs
  const describedByIds = [descriptionId, errorId, countId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {hideLabel ? (
        <VisuallyHidden>
          <Label htmlFor={id}>
            {label}
            {required && <span aria-hidden="true"> *</span>}
            {required && <VisuallyHidden> (required)</VisuallyHidden>}
          </Label>
        </VisuallyHidden>
      ) : (
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="text-destructive">*</span>
              <VisuallyHidden>(required)</VisuallyHidden>
            </>
          )}
        </Label>
      )}

      {/* Description */}
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {/* Form field */}
      <div className="relative">
        {children}
      </div>

      {/* Character count */}
      {maxLength !== undefined && currentLength !== undefined && (
        <p
          id={countId}
          className={cn(
            'text-xs text-right',
            currentLength > maxLength ? 'text-destructive' : 'text-muted-foreground'
          )}
          aria-live="polite"
        >
          {currentLength}/{maxLength} characters
          {currentLength > maxLength && (
            <VisuallyHidden> - exceeds maximum</VisuallyHidden>
          )}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          className="text-sm text-destructive flex items-center gap-1"
          role="alert"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Hook for form field accessibility props
 */
export function useFormFieldProps(config: {
  id?: string;
  hasError?: boolean;
  description?: string;
  required?: boolean;
}) {
  const generatedId = useId();
  const id = config.id || generatedId;

  return {
    id,
    'aria-invalid': config.hasError || undefined,
    'aria-required': config.required || undefined,
    'aria-describedby': config.description ? `${id}-description` : undefined,
  };
}
