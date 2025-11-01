/**
 * Password strength validation and scoring
 */

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordValidation {
  strength: PasswordStrength;
  score: number;
  requirements: PasswordRequirement[];
  isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordValidation {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'One number',
      met: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'One special character',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const score = (metCount / requirements.length) * 100;

  let strength: PasswordStrength = 'weak';
  if (score >= 80) strength = 'strong';
  else if (score >= 60) strength = 'good';
  else if (score >= 40) strength = 'fair';

  return {
    strength,
    score,
    requirements,
    isValid: metCount === requirements.length,
  };
}

export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak': return 'hsl(var(--destructive))';
    case 'fair': return 'hsl(30 100% 50%)';
    case 'good': return 'hsl(45 100% 50%)';
    case 'strong': return 'hsl(142 76% 36%)';
  }
}


export function suggestEmailCorrection(email: string): string | null {
  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
  ];

  const [, domain] = email.split('@');
  if (!domain) return null;

  for (const commonDomain of commonDomains) {
    if (domain !== commonDomain && isTypo(domain, commonDomain)) {
      return email.replace(domain, commonDomain);
    }
  }

  return null;
}

function isTypo(input: string, target: string): boolean {
  // Simple Levenshtein distance check
  if (Math.abs(input.length - target.length) > 2) return false;
  
  let differences = 0;
  for (let i = 0; i < Math.max(input.length, target.length); i++) {
    if (input[i] !== target[i]) differences++;
    if (differences > 2) return false;
  }
  
  return differences > 0 && differences <= 2;
}
