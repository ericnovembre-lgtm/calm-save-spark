import { validatePasswordStrength, getStrengthColor, type PasswordStrength } from '@/lib/password-strength';
import { Check, X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const validation = password ? validatePasswordStrength(password) : null;
  const strengthColor = validation ? getStrengthColor(validation.strength) : '';
  
  const strengthLabels: Record<PasswordStrength, string> = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };

  return (
    <AnimatePresence initial={false}>
      {password && validation && (
        <motion.div
          initial={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { height: 'auto', opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="space-y-3 mt-2">
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Password strength</span>
                <motion.span
                  key={validation.strength}
                  className="font-medium"
                  style={{ color: strengthColor }}
                  initial={prefersReducedMotion ? undefined : { scale: 1 }}
                  animate={
                    validation.strength === 'strong' && !prefersReducedMotion
                      ? { scale: [1, 1.15, 1] }
                      : { scale: 1 }
                  }
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {strengthLabels[validation.strength]}
                </motion.span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <motion.div
                  className={`h-full transition-all duration-300 rounded-full ${prefersReducedMotion ? '' : 'ease-out'}`}
                  style={{
                    width: `${validation.score}%`,
                    backgroundColor: strengthColor,
                    boxShadow: validation.strength === 'strong' && !prefersReducedMotion
                      ? `0 0 8px ${strengthColor}, 0 0 12px ${strengthColor}`
                      : 'none',
                  }}
                  animate={
                    validation.strength === 'strong' && !prefersReducedMotion
                      ? {
                          boxShadow: [
                            `0 0 8px ${strengthColor}, 0 0 12px ${strengthColor}`,
                            `0 0 12px ${strengthColor}, 0 0 20px ${strengthColor}`,
                            `0 0 8px ${strengthColor}, 0 0 12px ${strengthColor}`,
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>

            {/* Requirements checklist */}
            <div className="space-y-1.5">
              {validation.requirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-2 text-xs"
                >
                  {req.met ? (
                    <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
