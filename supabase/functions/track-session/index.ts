import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Parse User-Agent to extract device info
function parseUserAgent(ua: string): { deviceType: string; deviceName: string; browser: string; os: string } {
  let deviceType = 'desktop';
  let deviceName = 'Unknown Device';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone')) { os = 'iOS'; deviceType = 'mobile'; }
  else if (ua.includes('iPad')) { os = 'iPadOS'; deviceType = 'tablet'; }
  else if (ua.includes('Android')) { os = 'Android'; deviceType = 'mobile'; }

  // Detect Browser
  if (ua.includes('Chrome/')) {
    const match = ua.match(/Chrome\/(\d+)/);
    browser = `Chrome ${match?.[1] || ''}`;
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/(\d+)/);
    browser = `Safari ${match?.[1] || ''}`;
  } else if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/(\d+)/);
    browser = `Firefox ${match?.[1] || ''}`;
  } else if (ua.includes('Edge/')) {
    const match = ua.match(/Edge\/(\d+)/);
    browser = `Edge ${match?.[1] || ''}`;
  }

  // Detect Device Name
  if (ua.includes('iPhone')) deviceName = 'iPhone';
  else if (ua.includes('iPad')) deviceName = 'iPad';
  else if (ua.includes('Macintosh')) deviceName = 'MacBook';
  else if (ua.includes('Windows')) deviceName = 'Windows PC';
  else if (ua.includes('Android')) {
    const match = ua.match(/;\s*([^;)]+)\s*Build/);
    deviceName = match?.[1]?.trim() || 'Android Device';
  }

  return { deviceType, deviceName, browser, os };
}

// Get geo-location from IP using free API
async function getGeoLocation(ip: string): Promise<{
  city: string | null;
  country: string | null;
  countryCode: string | null;
  latitude: number | null;
  longitude: number | null;
}> {
  try {
    // Skip for local/private IPs
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '127.0.0.1' || ip === 'localhost') {
      return { city: null, country: null, countryCode: null, latitude: null, longitude: null };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,countryCode,lat,lon`);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        city: data.city,
        country: data.country,
        countryCode: data.countryCode,
        latitude: data.lat,
        longitude: data.lon,
      };
    }
  } catch (error) {
    console.error('[track-session] Geo-location lookup failed:', error);
  }

  return { city: null, country: null, countryCode: null, latitude: null, longitude: null };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request info
    const userAgent = req.headers.get('User-Agent') || '';
    const forwardedFor = req.headers.get('X-Forwarded-For');
    const realIp = req.headers.get('X-Real-IP');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    const deviceInfo = parseUserAgent(userAgent);
    const geoInfo = await getGeoLocation(ip);

    // Generate session token (truncated for display)
    const sessionToken = crypto.randomUUID().slice(0, 8);

    // Check for existing session from this IP/device combo
    const { data: existingSession } = await supabase
      .from('user_login_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('ip_address', ip)
      .eq('device_name', deviceInfo.deviceName)
      .maybeSingle();

    if (existingSession) {
      // Update existing session
      const { data, error } = await supabase
        .from('user_login_sessions')
        .update({
          last_active_at: new Date().toISOString(),
          browser: deviceInfo.browser,
          is_current: true,
        })
        .eq('id', existingSession.id)
        .select()
        .single();

      if (error) throw error;

      console.log('[track-session] Updated existing session:', existingSession.id);
      return new Response(JSON.stringify({ session: data, action: 'updated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark all other sessions as not current
    await supabase
      .from('user_login_sessions')
      .update({ is_current: false })
      .eq('user_id', user.id);

    // Insert new session
    const { data: newSession, error: insertError } = await supabase
      .from('user_login_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        device_type: deviceInfo.deviceType,
        device_name: deviceInfo.deviceName,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip_address: ip.replace(/\d+$/, 'xxx'), // Mask last octet for privacy
        city: geoInfo.city,
        country: geoInfo.country,
        country_code: geoInfo.countryCode,
        latitude: geoInfo.latitude,
        longitude: geoInfo.longitude,
        is_current: true,
        is_authorized: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('[track-session] Created new session:', newSession.id);
    return new Response(JSON.stringify({ session: newSession, action: 'created' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[track-session] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
