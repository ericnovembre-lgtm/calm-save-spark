import { useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

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
  showToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      value,
      onChange,
      error,
      showStrengthMeter = false,
      label = 'Password',
      id = 'password',
      autoComplete = 'current-password',
      placeholder = '••••••••',
      autoFocus = false,
      showToggle = true,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <div className="relative flex items-center">
          <Input
            ref={ref}
            id={id}
            name={id}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="relative z-10 pointer-events-auto pr-10"
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            spellCheck={false}
            autoCapitalize="none"
          />
          {showToggle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 z-20 h-10 w-10 p-0 hover:bg-transparent pointer-events-auto"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
            </Button>
          )}
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
);

PasswordInput.displayName = 'PasswordInput';
