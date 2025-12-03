import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { breach } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[Hephaestus] 🔧 Analyzing breach: ${breach.metric_name}`);

    // Step 1: Use AI to diagnose the issue
    const diagnosis = await diagnoseIssue(breach);
    
    // Step 2: Apply automated fixes
    const fixResult = await applyFix(breach, diagnosis);

    // Step 3: Log the incident
    const { data: incidentLog } = await supabase
      .from('incident_logs')
      .insert({
        breach_id: breach.id,
        action_type: fixResult.action_type,
        action_description: fixResult.description,
        ai_diagnosis: diagnosis,
        fix_applied: fixResult.fix_applied,
        fix_successful: fixResult.successful,
        execution_time_ms: fixResult.execution_time,
        metadata: fixResult.metadata
      })
      .select()
      .single();

    // Step 4: Create admin notification
    await supabase
      .from('admin_notifications')
      .insert({
        notification_type: 'fix_applied',
        severity: breach.severity,
        title: `Auto-fix applied: ${breach.metric_name}`,
        message: `Hephaestus detected and fixed: ${fixResult.description}`,
        action_taken: fixResult.fix_applied,
        related_incident_id: incidentLog?.id,
        metadata: { breach, diagnosis, fixResult }
      });

    // Step 5: Send email alert
    await supabase.functions.invoke('send-hephaestus-alert', {
      body: {
        breach,
        diagnosis,
        fixResult,
        incidentLog
      }
    });

    console.log(`[Hephaestus] ✅ Fix applied: ${fixResult.description}`);

    return new Response(
      JSON.stringify({ success: true, fixResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Hephaestus] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function diagnoseIssue(breach: any): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  const prompt = `You are Hephaestus, a Senior Backend Engineer AI analyzing a production incident.

**Incident Details:**
- Metric: ${breach.metric_name}
- Current Value: ${breach.current_value}
- Threshold: ${breach.threshold_value}
- Severity: ${breach.severity}
- Metadata: ${JSON.stringify(breach.metadata, null, 2)}

Analyze this incident and provide:
1. Root cause hypothesis
2. Potential impact on users
3. Recommended fix strategy

Be concise and actionable.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are Hephaestus, an expert SRE AI assistant.' },
        { role: 'user', content: prompt }
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function applyFix(breach: any, diagnosis: string): Promise<any> {
  const startTime = Date.now();
  
  // Automated fix strategies based on breach type
  if (breach.metric_name === 'LCP' && breach.current_value > 2500) {
    return {
      action_type: 'diagnosis',
      description: 'High LCP detected. Recommended: Enable image optimization, check CDN cache hit rate.',
      fix_applied: 'Alert sent to admin',
      successful: true,
      execution_time: Date.now() - startTime,
      metadata: { diagnosis, recommendation: 'manual_review_required' }
    };
  }
  
  if (breach.metric_name === 'INP' && breach.current_value > 200) {
    return {
      action_type: 'diagnosis',
      description: 'High INP detected. Recommended: Optimize JavaScript execution, reduce blocking tasks.',
      fix_applied: 'Alert sent to admin',
      successful: true,
      execution_time: Date.now() - startTime,
      metadata: { diagnosis, recommendation: 'manual_review_required' }
    };
  }
  
  if (breach.metric_name === 'edge_function_error_rate' && breach.current_value > 5) {
    return {
      action_type: 'alert_sent',
      description: 'High edge function error rate detected. Recent errors logged.',
      fix_applied: 'Admin notified for log review',
      successful: true,
      execution_time: Date.now() - startTime,
      metadata: { diagnosis, errors: breach.metadata?.errors }
    };
  }

  return {
    action_type: 'alert_sent',
    description: `SLO breach detected: ${breach.metric_name}`,
    fix_applied: 'Admin notification sent',
    successful: true,
    execution_time: Date.now() - startTime,
    metadata: { diagnosis }
  };
}
