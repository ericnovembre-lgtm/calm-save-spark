import { validatePasswordStrength, getStrengthColor, type PasswordStrength } from '@/lib/password-strength';
import { Check, X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const prefersReducedMotion = useReducedMotion();
  
  if (!password) return null;
  
  const validation = validatePasswordStrength(password);
  const strengthColor = getStrengthColor(validation.strength);
  
  const strengthLabels: Record<PasswordStrength, string> = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };

  return (
    <div className="space-y-3 mt-2">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className="font-medium" style={{ color: strengthColor }}>
            {strengthLabels[validation.strength]}
          </span>
        </div>
        <div className="h-2 bg-accent rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${prefersReducedMotion ? '' : 'ease-out'}`}
            style={{
              width: `${validation.score}%`,
              backgroundColor: strengthColor,
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
  );
}
