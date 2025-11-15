import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface OnboardingStatus {
  completed: boolean;
  currentStep: string | null;
  loading: boolean;
}

/**
 * Hook to check and manage user onboarding status
 * Automatically redirects incomplete users to onboarding
 */
export function useOnboardingStatus(autoRedirect = true): OnboardingStatus {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OnboardingStatus>({
    completed: true,
    currentStep: null,
    loading: true,
  });

  useEffect(() => {
    if (authLoading || !user) {
      setStatus({ completed: false, currentStep: null, loading: authLoading });
      return;
    }

    const checkOnboarding = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user.id)
          .single();

        const completed = profile?.onboarding_completed ?? false;
        const currentStep = profile?.onboarding_step ?? null;

        setStatus({
          completed,
          currentStep,
          loading: false,
        });

        // Auto-redirect to onboarding if not completed
        if (!completed && autoRedirect) {
          navigate('/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setStatus({ completed: false, currentStep: null, loading: false });
      }
    };

    checkOnboarding();
  }, [user, authLoading, autoRedirect, navigate]);

  return status;
}
