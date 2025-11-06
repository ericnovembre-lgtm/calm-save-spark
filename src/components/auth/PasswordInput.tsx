import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showStrengthMeter?: boolean;
  label?: string;
  id?: string;
  autoComplete?: string;
  placeholder?: string;
  autoFocus?: boolean;
  minimal?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({
    value,
    onChange,
    error,
    showStrengthMeter = false,
    label = 'Password',
    id = 'password',
    autoComplete = 'current-password',
    placeholder = '••••••••',
    autoFocus = false,
    minimal = false,
  }, forwardedRef) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const internalRef = useRef<HTMLInputElement>(null);
  
  // Merge internal ref with forwarded ref
  const inputRef = (forwardedRef as React.RefObject<HTMLInputElement>) || internalRef;

  // Auto-focus on mount or when autoFocus changes
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Minimal mode - no animations, simplified structure
  if (minimal) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
        </Label>
        <div className="relative pointer-events-auto">
          <Input
            ref={inputRef}
            id={id}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn("pr-10", error ? 'border-destructive' : '')}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            autoComplete={autoComplete}
            spellCheck={false}
            autoCapitalize="none"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent pointer-events-auto"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
          </Button>
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {error}
          </p>
        )}
        {showStrengthMeter && <PasswordStrengthMeter password={value} />}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          isFocused ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn("pr-10", error ? 'border-destructive' : '')}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete={autoComplete}
          spellCheck={false}
          autoCapitalize="none"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "absolute right-0 top-0 h-full px-3",
            "hover:bg-transparent focus-visible:ring-1 focus-visible:ring-ring",
            "transition-all duration-200"
          )}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {prefersReducedMotion ? (
              <div key={showPassword ? 'hide' : 'show'}>
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
              </div>
            ) : (
              <motion.div
                key={showPassword ? 'hide' : 'show'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
      
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
      
      {showStrengthMeter && <PasswordStrengthMeter password={value} />}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
