import { supabase } from "@/integrations/supabase/client";

const REMEMBER_ME_KEY = 'saveplus_remember_me';
const SESSION_ACTIVE_KEY = 'saveplus_session_active';

export type AppUser = {
  id: string;
  email?: string;
  full_name?: string;
  role?: 'user' | 'admin';
  avatar_url?: string;
};

export const getClientUser = async (): Promise<AppUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Fetch profile data including avatar
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();
  
  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || user.user_metadata?.full_name,
    role: user.user_metadata?.role || 'user',
    avatar_url: profile?.avatar_url,
  };
};

export const signOut = async () => {
  await supabase.auth.signOut();
  clearRememberMe();
};

/**
 * Store the "Remember me" preference
 */
export const setRememberMe = (remember: boolean) => {
  if (remember) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
};

/**
 * Get the "Remember me" preference
 */
export const getRememberMe = (): boolean => {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
};

/**
 * Clear the "Remember me" preference
 */
export const clearRememberMe = () => {
  localStorage.removeItem(REMEMBER_ME_KEY);
  sessionStorage.removeItem(SESSION_ACTIVE_KEY);
};

/**
 * Mark session as active (called on login)
 */
export const markSessionActive = () => {
  sessionStorage.setItem(SESSION_ACTIVE_KEY, 'true');
};

/**
 * Check if session should persist across browser restarts
 * If "Remember me" is NOT checked and the session was active but
 * sessionStorage is now empty, it means browser was closed
 */
export const shouldClearSession = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // No session, nothing to clear
  if (!session) return false;
  
  // User wants to be remembered, keep session
  const rememberMe = getRememberMe();
  if (rememberMe) return false;
  
  // Check if this is a new browser session
  const wasActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);
  
  // If sessionStorage is empty but we have a session in localStorage,
  // it means the browser was closed and reopened - clear the session
  if (!wasActive) {
    return true;
  }
  
  return false;
};

/**
 * Initialize session management
 * Call this on app startup to clear sessions if "Remember me" wasn't checked
 */
export const initializeSessionManagement = async () => {
  const shouldClear = await shouldClearSession();
  
  if (shouldClear) {
    await signOut();
  } else {
    // Mark session as active for this browser session
    markSessionActive();
  }
};
