import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { sanitizeEmail } from '@/lib/auth-utils';
import { suggestEmailCorrection } from '@/lib/password-strength';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onValidation?: (isValid: boolean) => void;
  autoFocus?: boolean;
  minimal?: boolean;
}

export function EmailInput({ value, onChange, error, onValidation, autoFocus = false, minimal = false }: EmailInputProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount or when autoFocus changes
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(value) && value.length <= 255;
    setIsValid(valid);
    onValidation?.(valid);

    // Check for typos in domain
    if (valid) {
      const correctedEmail = suggestEmailCorrection(value);
      setSuggestion(correctedEmail);
    } else {
      setSuggestion(null);
    }
  }, [value, onValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(sanitizeEmail(e.target.value));
  };

  const applySuggestion = () => {
    if (suggestion) {
      onChange(suggestion);
      setSuggestion(null);
    }
  };

  // Minimal mode - no animations or icons
  if (minimal) {
    return (
      <div className="space-y-2">
        <Label 
          htmlFor="email" 
          className="text-sm font-medium text-muted-foreground"
        >
          Email address
        </Label>
        <Input
          ref={inputRef}
          id="email"
          type="email"
          value={value}
          onChange={handleChange}
          placeholder="you@example.com"
          className={error ? 'border-destructive' : ''}
          aria-invalid={!!error}
          aria-describedby={error ? 'email-error' : undefined}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
        />
        {error && (
          <p id="email-error" className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label 
        htmlFor="email" 
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          isFocused ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Email address
      </Label>
      <div className="relative pointer-events-auto z-10">
        <Input
          ref={inputRef}
          id="email"
          type="email"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="you@example.com"
          className={cn(
            "pr-10 relative z-10",
            error ? 'border-destructive' : isValid && value ? 'border-green-600' : ''
          )}
          aria-invalid={!!error}
          aria-describedby={error ? 'email-error' : suggestion ? 'email-suggestion' : undefined}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
        />
        <div className="absolute right-3 top-3 pointer-events-none">
          <AnimatePresence mode="wait">
            {isValid && value && !error && (
              prefersReducedMotion ? (
                <div key="valid">
                  <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                </div>
              ) : (
                <motion.div
                  key="valid"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                </motion.div>
              )
            )}
            {error && (
              prefersReducedMotion ? (
                <div key="error">
                  <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                </div>
              ) : (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {error && (
        <p id="email-error" className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
      
      {suggestion && !error && (
        <button
          type="button"
          onClick={applySuggestion}
          id="email-suggestion"
          className="text-xs text-primary hover:underline"
        >
          Did you mean <span className="font-medium">{suggestion}</span>?
        </button>
      )}
    </div>
  );
}
