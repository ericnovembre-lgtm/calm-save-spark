import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { course_id } = await req.json();

    // Verify course completion
    const { data: progress, error: progressError } = await supabaseClient
      .from('user_course_progress')
      .select('*, literacy_courses(*)')
      .eq('course_id', course_id)
      .eq('progress_percentage', 100)
      .single();

    if (progressError || !progress) {
      return new Response(JSON.stringify({ error: 'Course not completed or not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if certificate already exists
    const { data: existing } = await supabaseClient
      .from('course_certificates')
      .select('*')
      .eq('course_id', course_id)
      .single();

    if (existing) {
      return new Response(JSON.stringify(existing), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique certificate number
    const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Issue certificate
    const { data: certificate, error: certError } = await supabaseClient
      .from('course_certificates')
      .insert({
        course_id,
        certificate_number: certNumber,
      })
      .select('*, literacy_courses(*)')
      .single();

    if (certError) {
      console.error('Error issuing certificate:', certError);
      throw certError;
    }

    console.log('Certificate issued:', certNumber);

    return new Response(
      JSON.stringify(certificate),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in issue-certificate:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
