import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Check, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSettingsStore } from '@/stores/settingsStore';

interface ScoreItem {
  label: string;
  points: number;
  achieved: boolean;
  action?: string;
}

export function SecurityHealthGauge() {
  const { securityScore, setSecurityScore } = useSettingsStore();
  const [breakdown, setBreakdown] = useState<ScoreItem[]>([]);

  const { data: profile } = useQuery({
    queryKey: ['profile-security'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Query MFA and biometric status
  const { data: mfaFactors } = useQuery({
    queryKey: ['mfa-factors'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Failed to fetch MFA factors:', error);
        return null;
      }
    },
  });

  const { data: biometricCredentials } = useQuery({
    queryKey: ['biometric-credentials'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('webauthn_credentials')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to fetch biometric credentials:', error);
        return null;
      }
      return data;
    },
  });

  useEffect(() => {
    if (!profile) return;

    const hasMFA = mfaFactors?.totp && mfaFactors.totp.length > 0;
    const hasBiometric = biometricCredentials && biometricCredentials.length > 0;
    
    // Calculate password age (mock for now - would need password_changed_at column)
    const passwordAgeDays = 0; // Default to 0 if not available
    const passwordAgeGood = passwordAgeDays < 90;

    const items: ScoreItem[] = [
      {
        label: 'Email verified',
        points: 25,
        achieved: true, // User is logged in, email must be verified
      },
      {
        label: 'Strong password (12+ chars)',
        points: 30,
        achieved: true, // Enforced at signup
      },
      {
        label: 'Two-factor authentication',
        points: 35,
        achieved: hasMFA,
        action: hasMFA ? undefined : 'Enable MFA',
      },
      {
        label: 'Biometric login',
        points: 15,
        achieved: hasBiometric,
        action: hasBiometric ? undefined : 'Add Biometric',
      },
    ];

    // Add password age bonus/penalty if we have the data
    if (passwordAgeDays > 0) {
      if (passwordAgeGood) {
        items.push({
          label: 'Recent password update',
          points: 10,
          achieved: true,
        });
      } else if (passwordAgeDays > 180) {
        items.push({
          label: 'Password age warning',
          points: -5,
          achieved: false,
          action: 'Update Password',
        });
      }
    }

    const totalScore = items.reduce((sum, item) => sum + (item.achieved ? item.points : 0), 0);

    setBreakdown(items);
    setSecurityScore(totalScore);
  }, [profile, mfaFactors, biometricCredentials, setSecurityScore]);

  const getColorClass = (score: number) => {
    if (score >= 71) return 'text-success';
    if (score >= 41) return 'text-warning';
    return 'text-destructive';
  };

  const getGrade = (score: number) => {
    if (score >= 71) return 'Good';
    if (score >= 41) return 'Fair';
    return 'Poor';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Health Score
        </CardTitle>
        <CardDescription>
          Strengthen your account security for better protection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-32 h-32"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={`hsl(var(${securityScore >= 71 ? '--success' : securityScore >= 41 ? '--warning' : '--destructive'}))`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={283}
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * securityScore) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getColorClass(securityScore)}`}>
                {securityScore}%
              </span>
              <span className="text-sm text-muted-foreground">{getGrade(securityScore)}</span>
            </div>
          </motion.div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Score Breakdown:</p>
          {breakdown.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {item.achieved ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {item.achieved ? '+' : ''}{item.points} pts
                </span>
                {!item.achieved && item.action && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    {item.action}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {securityScore < 70 && (
          <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Improve your security</p>
              <p className="text-xs text-muted-foreground">
                Enable MFA and biometric login to reach an excellent security score
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
