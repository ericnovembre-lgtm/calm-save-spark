import { useState, useRef, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecureFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autoBlur?: boolean;
  disableCopy?: boolean;
  clearOnUnmount?: boolean;
  onValueChange?: (value: string) => void;
}

export const SecureFieldInput = forwardRef<HTMLInputElement, SecureFieldInputProps>(
  (
    {
      type = 'text',
      autoBlur = true,
      disableCopy = false,
      clearOnUnmount = true,
      className,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState('');
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
    const isPasswordField = type === 'password';

    // Auto-blur on focus loss
    useEffect(() => {
      if (!autoBlur) return;

      const handleFocusOut = () => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.blur();
        }
      };

      const currentInput = inputRef.current;
      if (currentInput) {
        currentInput.addEventListener('focusout', handleFocusOut);
        return () => currentInput.removeEventListener('focusout', handleFocusOut);
      }
    }, [autoBlur, inputRef]);

    // Clear value on unmount
    useEffect(() => {
      return () => {
        if (clearOnUnmount) {
          setInternalValue('');
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        }
      };
    }, [clearOnUnmount, inputRef]);

    // Disable copy/paste for sensitive fields
    const handleCopyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (disableCopy) {
        e.preventDefault();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
      
      // Auto-hide password after 3 seconds
      if (!showPassword) {
        setTimeout(() => setShowPassword(false), 3000);
      }
    };

    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type={inputType}
          value={internalValue}
          onChange={handleChange}
          onCopy={handleCopyPaste}
          onPaste={handleCopyPaste}
          onCut={handleCopyPaste}
          className={cn(
            'pr-10',
            disableCopy && 'select-none',
            className
          )}
          autoComplete={isPasswordField ? 'new-password' : 'off'}
          {...props}
        />
        {isPasswordField && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? 'Hide password' : 'Show password'}
            </span>
          </Button>
        )}
      </div>
    );
  }
);

SecureFieldInput.displayName = 'SecureFieldInput';
