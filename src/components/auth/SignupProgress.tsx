import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { validatePasswordStrength } from '@/lib/password-strength';

interface SignupProgressProps {
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
}

export function SignupProgress({ 
  email, 
  password, 
  confirmPassword,
  agreeToTerms 
}: SignupProgressProps) {
  const prefersReducedMotion = useReducedMotion();

  // Calculate step completion
  const emailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValidation = validatePasswordStrength(password);
  const passwordStrong = passwordValidation.strength === 'strong' && password === confirmPassword && password.length > 0;
  const termsAccepted = agreeToTerms;

  const steps: ProgressStep[] = [
    { id: 'email', label: 'Valid email', completed: emailValid },
    { id: 'password', label: 'Strong password', completed: passwordStrong },
    { id: 'terms', label: 'Terms accepted', completed: termsAccepted },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  return (
    <div 
      className="space-y-3"
      role="status"
      aria-label="Signup progress"
      aria-live="polite"
    >
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Setup progress</span>
          <span className="text-foreground font-medium">
            {completedCount}/{totalSteps} complete
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isActive = !isCompleted && (index === 0 || steps[index - 1].completed);

          return (
            <motion.div
              key={step.id}
              className={cn(
                "flex items-center gap-1.5 p-2 rounded-lg transition-colors duration-200",
                isCompleted && "bg-primary/10",
                isActive && "bg-accent",
                !isCompleted && !isActive && "bg-muted/50"
              )}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  prefersReducedMotion ? (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />
                    </div>
                  ) : (
                    <motion.div
                      className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    >
                      <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />
                    </motion.div>
                  )
                ) : (
                  <Circle 
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-foreground" : "text-muted-foreground/50"
                    )} 
                    aria-hidden="true"
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  isCompleted && "text-primary",
                  isActive && "text-foreground",
                  !isCompleted && !isActive && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              <span className="sr-only">
                {isCompleted ? 'completed' : isActive ? 'in progress' : 'pending'}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Completion message */}
      {progressPercentage === 100 && (
        prefersReducedMotion ? (
          <div className="text-xs text-center text-primary font-medium py-1">
            Ready to create your account!
          </div>
        ) : (
          <motion.div
            className="text-xs text-center text-primary font-medium py-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            ✓ Ready to create your account!
          </motion.div>
        )
      )}
    </div>
  );
}
