import { useState, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { sanitizeEmail } from '@/lib/auth-utils';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const emailSchema = z.string().trim().email().max(255);

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ value, onChange, error, autoFocus = false }, ref) => {
    const [isValid, setIsValid] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    // Validate email with debounce
    useEffect(() => {
      if (!value) {
        setShowValidation(false);
        return;
      }

      const timer = setTimeout(() => {
        const result = emailSchema.safeParse(value);
        setIsValid(result.success);
        setShowValidation(true);
      }, 300);

      return () => clearTimeout(timer);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeEmail(e.target.value);
      onChange(sanitized);
    };

    return (
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            id="email"
            type="email"
            value={value}
            onChange={handleChange}
            placeholder="you@example.com"
            className={cn(
              'pr-10',
              error && 'border-destructive',
              !error && showValidation && isValid && 'border-green-600'
            )}
            aria-invalid={!!error}
            aria-describedby={error ? 'email-error' : undefined}
            autoComplete="email"
            autoFocus={autoFocus}
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
          />
          {/* Validation icon */}
          {!error && showValidation && isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            </div>
          )}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
            </div>
          )}
        </div>
        {error && (
          <p id="email-error" className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

EmailInput.displayName = 'EmailInput';
