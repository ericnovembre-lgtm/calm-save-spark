import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ConversationalOnboarding } from '@/components/onboarding/ConversationalOnboarding';
import { Loader2 } from 'lucide-react';

export default function ConversationalWelcome() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_step')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_step === 'complete') {
        navigate('/dashboard');
        return;
      }

      setUserId(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return <ConversationalOnboarding userId={userId} />;
}
