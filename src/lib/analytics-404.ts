/**
 * 404 Analytics tracking utilities
 */

import { supabase } from '@/integrations/supabase/client';
import type { RouteSuggestion } from './route-suggestions';

export interface NotFoundAnalytics {
  attemptedUrl: string;
  referrer: string | null;
  suggestionsShown: RouteSuggestion[];
  suggestionClicked?: string;
  contextualHelpShown: boolean;
  recentPagesCount: number;
}

/**
 * Track a 404 page view
 */
export async function track404PageView(data: NotFoundAnalytics): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('page_not_found_analytics').insert([{
      user_id: user?.id || null,
      attempted_url: data.attemptedUrl,
      referrer: data.referrer,
      suggestions_shown: data.suggestionsShown as any,
      suggestion_clicked: data.suggestionClicked || null,
      contextual_help_shown: data.contextualHelpShown,
      recent_pages_count: data.recentPagesCount,
      user_agent: navigator.userAgent,
    }]);
  } catch (error) {
    console.error('Failed to track 404 analytics:', error);
  }
}

/**
 * Track when a suggestion is clicked
 */
export async function trackSuggestionClick(
  attemptedUrl: string,
  clickedPath: string
): Promise<void> {
  try {
    // We'll track this as a separate event for real-time insights
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('page_not_found_analytics').insert([{
      user_id: user?.id || null,
      attempted_url: attemptedUrl,
      referrer: document.referrer,
      suggestions_shown: [] as any,
      suggestion_clicked: clickedPath,
      contextual_help_shown: false,
      recent_pages_count: 0,
      user_agent: navigator.userAgent,
    }]);
  } catch (error) {
    console.error('Failed to track suggestion click:', error);
  }
}

/**
 * Check for custom redirects
 */
export async function checkCustomRedirect(
  fromPath: string
): Promise<{ toPath: string; redirectId: string } | null> {
  try {
    const { data, error } = await supabase
      .from('custom_redirects')
      .select('id, to_path')
      .eq('from_path', fromPath)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    return {
      toPath: data.to_path,
      redirectId: data.id,
    };
  } catch (error) {
    console.error('Failed to check custom redirect:', error);
    return null;
  }
}

/**
 * Increment redirect usage count
 */
export async function trackRedirectUsage(redirectId: string): Promise<void> {
  try {
    await supabase.rpc('increment_redirect_usage', {
      redirect_id: redirectId,
    });
  } catch (error) {
    console.error('Failed to track redirect usage:', error);
  }
}
