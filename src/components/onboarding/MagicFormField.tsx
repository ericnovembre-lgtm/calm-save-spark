import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Check, AlertCircle } from "lucide-react";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagicFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isValid?: boolean;
  showValidation?: boolean;
  icon?: React.ReactNode;
}

export const MagicFormField = forwardRef<HTMLInputElement, MagicFormFieldProps>(
  ({ label, error, isValid, showValidation = false, icon, className, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const isLabelFloating = isFocused || hasValue;

    return (
      <div className="relative w-full">
        {/* Input container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <motion.div 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              animate={isFocused && !prefersReducedMotion ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={!prefersReducedMotion && isFocused ? { transform: 'scale(1.01)' } : undefined}
            className={cn(
              "w-full px-4 py-3 text-base bg-background border-2 rounded-lg transition-all",
              "focus:outline-none focus:ring-0",
              "placeholder-transparent",
              icon ? "pl-11" : "",
              error 
                ? "border-destructive focus:border-destructive" 
                : isFocused
                ? "border-primary"
                : "border-border focus:border-primary",
              className
            )}
          />

          {/* Floating label */}
          <motion.label
            className={cn(
              "absolute left-4 pointer-events-none transition-all origin-left",
              icon ? "left-11" : "left-4",
              isLabelFloating 
                ? "top-0 -translate-y-1/2 text-xs bg-background px-1" 
                : "top-1/2 -translate-y-1/2 text-base",
              error 
                ? "text-destructive" 
                : isFocused 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
            animate={!prefersReducedMotion ? {
              scale: isLabelFloating ? 0.85 : 1,
              y: isLabelFloating ? "-50%" : "-50%"
            } : {}}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {label}
          </motion.label>

          {/* Validation indicator */}
          <AnimatePresence>
            {showValidation && (isValid || error) && (
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2"
                initial={prefersReducedMotion ? false : { scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                {isValid ? (
                  <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
                ) : error ? (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Focus glow effect */}
          {isFocused && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                boxShadow: [
                  "0 0 0 0 hsl(var(--primary) / 0)",
                  "0 0 0 4px hsl(var(--primary) / 0.1)",
                  "0 0 0 8px hsl(var(--primary) / 0)"
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Error message with shake animation */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="mt-1 text-sm text-destructive flex items-center gap-1"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -5, x: 0 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                x: prefersReducedMotion ? 0 : [0, -5, 5, -5, 5, 0]
              }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ 
                opacity: { duration: 0.2 },
                y: { duration: 0.2 },
                x: { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
              }}
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Character count for text inputs */}
        {props.maxLength && hasValue && (
          <motion.p
            className="mt-1 text-xs text-muted-foreground text-right"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {(props.value?.toString() || "").length} / {props.maxLength}
          </motion.p>
        )}
      </div>
    );
  }
);

MagicFormField.displayName = "MagicFormField";
