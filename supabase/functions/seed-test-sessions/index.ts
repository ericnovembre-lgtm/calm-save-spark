import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEST_SESSIONS = [
  {
    session_token: 'test-sf-001',
    device_type: 'desktop',
    device_name: 'MacBook Pro',
    browser: 'Chrome 120',
    os: 'macOS',
    ip_address: '192.168.1.xxx',
    city: 'San Francisco',
    country: 'United States',
    country_code: 'US',
    latitude: 37.7749,
    longitude: -122.4194,
    is_current: true,
    is_authorized: true,
  },
  {
    session_token: 'test-ny-002',
    device_type: 'mobile',
    device_name: 'iPhone 15',
    browser: 'Safari 17',
    os: 'iOS',
    ip_address: '10.0.0.xxx',
    city: 'New York',
    country: 'United States',
    country_code: 'US',
    latitude: 40.7128,
    longitude: -74.0060,
    is_current: false,
    is_authorized: true,
  },
  {
    session_token: 'test-ldn-003',
    device_type: 'tablet',
    device_name: 'iPad Pro',
    browser: 'Safari 17',
    os: 'iPadOS',
    ip_address: '172.16.0.xxx',
    city: 'London',
    country: 'United Kingdom',
    country_code: 'GB',
    latitude: 51.5074,
    longitude: -0.1278,
    is_current: false,
    is_authorized: true,
  },
  {
    session_token: 'test-msc-004',
    device_type: 'desktop',
    device_name: 'Windows PC',
    browser: 'Chrome 119',
    os: 'Windows',
    ip_address: '203.0.113.xxx',
    city: 'Moscow',
    country: 'Russia',
    country_code: 'RU',
    latitude: 55.7558,
    longitude: 37.6173,
    is_current: false,
    is_authorized: false, // Suspicious!
  },
];

const TEST_SECURITY_EVENTS = [
  {
    event_type: 'login',
    event_message: 'New login from Chrome (San Francisco)',
    severity: 'success',
    metadata: { browser: 'Chrome 120', location: 'San Francisco, US' },
  },
  {
    event_type: 'mfa_enabled',
    event_message: 'Two-factor authentication enabled',
    severity: 'success',
    metadata: { method: 'authenticator_app' },
  },
  {
    event_type: 'session_revoked',
    event_message: 'Session revoked: Windows PC (Moscow)',
    severity: 'warning',
    metadata: { device: 'Windows PC', location: 'Moscow, RU' },
  },
  {
    event_type: 'suspicious_activity',
    event_message: 'Suspicious login attempt blocked from Moscow',
    severity: 'critical',
    metadata: { ip: '203.0.113.xxx', location: 'Moscow, RU' },
  },
  {
    event_type: 'password_change',
    event_message: 'Password changed successfully',
    severity: 'success',
    metadata: {},
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clear existing test sessions for this user
    await supabase
      .from('user_login_sessions')
      .delete()
      .eq('user_id', user.id)
      .like('session_token', 'test-%');

    // Insert test sessions
    const sessionsToInsert = TEST_SESSIONS.map((s, i) => ({
      ...s,
      user_id: user.id,
      last_active_at: new Date(Date.now() - i * 3600000).toISOString(), // Stagger times
    }));

    const { data: sessions, error: sessionsError } = await supabase
      .from('user_login_sessions')
      .insert(sessionsToInsert)
      .select();

    if (sessionsError) throw sessionsError;

    // Insert test security events
    const eventsToInsert = TEST_SECURITY_EVENTS.map((e, i) => ({
      ...e,
      user_id: user.id,
      created_at: new Date(Date.now() - i * 86400000).toISOString(), // Stagger by days
    }));

    const { data: events, error: eventsError } = await supabase
      .from('security_audit_log')
      .insert(eventsToInsert)
      .select();

    if (eventsError) throw eventsError;

    console.log(`[seed-test-sessions] Created ${sessions?.length} sessions and ${events?.length} events for user ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true,
      sessions_created: sessions?.length || 0,
      events_created: events?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[seed-test-sessions] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
