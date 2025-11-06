import { useState, useRef, useEffect } from 'react';
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

export function PasswordInput({
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
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="relative pointer-events-auto z-10">
        <Input
          ref={inputRef}
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn("pr-10 relative z-10", error ? 'border-destructive' : '')}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete={autoComplete}
          spellCheck={false}
          autoCapitalize="none"
        />
        <div className="absolute right-0 top-0 h-full flex items-center pointer-events-none">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-full px-3 pointer-events-auto",
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
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
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
