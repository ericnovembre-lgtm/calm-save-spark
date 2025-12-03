import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logSessionRevoked } from '@/lib/security-logger';

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_type: string | null;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  city: string | null;
  country: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  is_current: boolean;
  is_authorized: boolean;
  last_active_at: string;
  created_at: string;
}

// Convert lat/lng to map percentage coordinates for SVG viewBox 100x50
function geoToMapCoords(lat: number | null, lng: number | null): { x: number; y: number } {
  if (lat === null || lng === null) {
    // Default to center of 100x50 viewBox
    return { x: 50, y: 25 };
  }
  
  // Map coordinates: x = 0-100 (left to right), y = 0-50 (top to bottom)
  // Longitude: -180 to 180 -> 0 to 100
  const x = ((lng + 180) / 360) * 100;
  // Latitude: 90 to -90 -> 0 to 50 (scaled to match SVG viewBox height)
  const y = ((90 - lat) / 180) * 50;
  
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(50, y)) };
}

export function useUserSessions() {
  return useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('user_login_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('last_active_at', { ascending: false });

      if (error) throw error;
      
      // Transform to include map coordinates
      return (data || []).map((s: UserSession) => ({
        ...s,
        coordinates: geoToMapCoords(s.latitude, s.longitude),
      }));
    },
    staleTime: 30_000, // 30 seconds
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, deviceName, location }: { 
      sessionId: string; 
      deviceName?: string; 
      location?: string;
    }) => {
      const { error } = await supabase
        .from('user_login_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      return { sessionId, deviceName, location };
    },
    onSuccess: ({ deviceName, location }) => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      logSessionRevoked({ device_name: deviceName, location });
    },
  });
}

export function useTrackSession() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('track-session');
      if (error) throw error;
      return data;
    },
  });
}
