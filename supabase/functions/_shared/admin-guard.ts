/**
 * Admin authorization middleware for edge functions
 * Validates that the authenticated user has admin role
 * 
 * SECURITY: This performs server-side authorization checks to prevent
 * unauthorized access to admin-only operations.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

export interface AdminCheckResult {
  isAdmin: boolean;
  userId: string;
  error?: Response;
}

/**
 * Enforces admin role requirement for an edge function
 * Returns null if authorized, otherwise returns error Response
 * 
 * @param req - The incoming request
 * @param supabase - Supabase client (with service role key)
 * @param corsHeaders - CORS headers to include in responses
 * @returns null if authorized, error Response otherwise
 */
export async function enforceAdmin(
  req: Request,
  supabase: SupabaseClient,
  corsHeaders: Record<string, string>
): Promise<Response | null> {
  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('[ADMIN_CHECK] Missing authorization header');
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.warn('[ADMIN_CHECK] Invalid or expired token');
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          message: 'Invalid or expired authentication token' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user has admin role using server-side query
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('[ADMIN_CHECK] Database error checking role:', roleError);
      return new Response(
        JSON.stringify({ 
          error: 'Internal error', 
          message: 'Failed to verify authorization' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!roleData) {
      console.warn('[ADMIN_CHECK] Access denied for user:', user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Forbidden', 
          message: 'Admin access required. This operation is restricted to administrators.' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('[ADMIN_CHECK] Admin access granted for user:', user.id);
    return null; // Authorization successful
  } catch (error) {
    console.error('[ADMIN_CHECK] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal error', 
        message: 'An unexpected error occurred during authorization' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * Checks admin status without blocking
 * Useful when you need to know admin status but don't want to block execution
 * 
 * @param supabase - Supabase client (with service role key)
 * @param userId - User ID to check
 * @returns Promise<boolean> - true if user is admin
 */
export async function isAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    return !error && !!data;
  } catch (error) {
    console.error('[ADMIN_CHECK] Error checking admin status:', error);
    return false;
  }
}

/**
 * Gets user from auth header
 * @param req - The incoming request
 * @param supabase - Supabase client
 * @returns User object or null
 */
export async function getUserFromAuth(
  req: Request,
  supabase: SupabaseClient
): Promise<{ id: string; email?: string } | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}
