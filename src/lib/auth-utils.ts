import { supabase } from "@/integrations/supabase/client";

export interface AuthError {
  message: string;
  code?: string;
}

export function getAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred';
  
  const errorMessage = error.message || error.error_description || String(error);
  
  // Map common Supabase error messages to user-friendly versions
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (errorMessage.includes('Email not confirmed')) {
    return 'Please verify your email address before logging in.';
  }
  if (errorMessage.includes('User already registered')) {
    return 'An account with this email already exists. Please log in.';
  }
  if (errorMessage.includes('Password should be at least 6 characters')) {
    return 'Password must be at least 6 characters long.';
  }
  if (errorMessage.includes('Too many requests')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  
  return errorMessage;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password-for-check',
    });
    
    // If we get "Invalid login credentials", the email exists
    // If we get "Email not confirmed", the email exists
    // If we get anything else, we can't be sure
    if (error?.message.includes('Invalid login credentials')) return true;
    if (error?.message.includes('Email not confirmed')) return true;
    
    return false;
  } catch {
    return false;
  }
}

export function getReturnUrl(): string {
  if (typeof window === 'undefined') return '/onboarding';
  
  // Check query params first
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl');
  if (returnUrl) return returnUrl;
  
  // Check sessionStorage
  const storedUrl = sessionStorage.getItem('auth_return_url');
  if (storedUrl) {
    sessionStorage.removeItem('auth_return_url');
    return storedUrl;
  }
  
  return '/onboarding';
}

export function setReturnUrl(url: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('auth_return_url', url);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
