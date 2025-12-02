import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to check if the current user has admin role
 * Uses server-side validation via user_roles table
 * 
 * @returns {isAdmin, loading} - Admin status and loading state
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin role:', error);
        }

        setIsAdmin(!!data);
        setLoading(false);
      } catch (error) {
        console.error('Error in admin check:', error);
        setLoading(false);
      }
    };

    checkAdminRole();
  }, []);

  return { isAdmin, loading };
}
