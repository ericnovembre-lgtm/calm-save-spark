import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base64URL decoding helper
function base64urlDecode(base64url: string): Uint8Array {
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { credential, deviceName } = await req.json();

    // Decode and parse clientDataJSON
    const clientDataBytes = base64urlDecode(credential.response.clientDataJSON);
    const clientDataText = new TextDecoder().decode(clientDataBytes);
    const clientData = JSON.parse(clientDataText);
    
    // Extract challenge from clientData
    const receivedChallenge = clientData.challenge;

    if (!receivedChallenge) {
      return new Response(JSON.stringify({ error: 'No challenge in clientDataJSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify challenge exists and matches
    const { data: challengeData, error: challengeError } = await supabase
      .from('webauthn_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'registration')
      .eq('challenge', receivedChallenge)
      .single();

    if (challengeError || !challengeData) {
      console.error('Challenge verification failed:', challengeError);
      return new Response(JSON.stringify({ error: 'Invalid challenge' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify challenge is not expired (5 minutes)
    const challengeAge = Date.now() - new Date(challengeData.created_at).getTime();
    if (challengeAge > 5 * 60 * 1000) {
      return new Response(JSON.stringify({ error: 'Challenge expired' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store credential
    const { error: insertError } = await supabase
      .from('webauthn_credentials')
      .insert({
        user_id: user.id,
        credential_id: credential.id,
        public_key: credential.response.publicKey,
        counter: 0,
        transports: credential.response.transports,
        device_name: deviceName || 'Biometric Device',
      });

    if (insertError) {
      console.error('Error storing credential:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to store credential' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete used challenge
    await supabase
      .from('webauthn_challenges')
      .delete()
      .eq('id', challengeData.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
