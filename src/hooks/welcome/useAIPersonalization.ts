import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PersonalizationContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  returningUser: boolean;
}

/**
 * Hook for AI-powered personalization
 * Generates contextual welcome messages using Lovable AI
 */
export function useAIPersonalization() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonalizedMessage = async () => {
      try {
        setLoading(true);
        
        // Determine context
        const hour = new Date().getHours();
        let timeOfDay: PersonalizationContext['timeOfDay'];
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
        else timeOfDay = 'night';

        const deviceType: PersonalizationContext['deviceType'] = 
          window.innerWidth < 768 ? 'mobile' :
          window.innerWidth < 1024 ? 'tablet' : 'desktop';

        const returningUser = localStorage.getItem('hasVisited') === 'true';
        localStorage.setItem('hasVisited', 'true');

        // Call AI personalization function
        const { data, error: functionError } = await supabase.functions.invoke('ai-personalize', {
          body: { timeOfDay, deviceType, returningUser }
        });

        if (functionError) {
          throw functionError;
        }

        if (data?.message) {
          setMessage(data.message);
        } else if (data?.fallback) {
          setMessage(data.fallback);
        }
      } catch (err) {
        console.error('AI personalization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load personalization');
        // Use fallback message
        setMessage('Welcome to $ave+! Start your savings journey today.');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalizedMessage();
  }, []);

  return { message, loading, error };
}
