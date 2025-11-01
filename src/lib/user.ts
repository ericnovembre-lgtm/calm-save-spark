/**
 * User utilities for $ave+
 * Client-safe user lookup for analytics and features
 */

import { supabase } from '@/integrations/supabase/client';

export interface ClientUser {
  id: string;
  email?: string;
}

/**
 * Get current authenticated user (client-side only)
 * Returns null if no user is authenticated
 */
export async function getClientUser(): Promise<ClientUser | null> {
  if (typeof window === 'undefined') return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
    };
  } catch (error) {
    console.error('[User] Failed to get client user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getClientUser();
  return user !== null;
}
