import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { sanitizeEmail } from '@/lib/auth-utils';
import { suggestEmailCorrection } from '@/lib/password-strength';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onValidation?: (isValid: boolean) => void;
}

export function EmailInput({ value, onChange, error, onValidation }: EmailInputProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

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

  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-medium">
        Email address
      </Label>
      <div className="relative">
        <Input
          id="email"
          type="email"
          value={value}
          onChange={handleChange}
          placeholder="you@example.com"
          className={`pr-10 ${error ? 'border-destructive' : isValid && value ? 'border-green-600' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? 'email-error' : suggestion ? 'email-suggestion' : undefined}
          autoComplete="email"
        />
        {isValid && value && !error && (
          <Check className="absolute right-3 top-3 h-4 w-4 text-green-600" aria-hidden="true" />
        )}
        {error && (
          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" aria-hidden="true" />
        )}
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
