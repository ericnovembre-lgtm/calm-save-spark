import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appName, permissions } = await req.json();

    if (!appName || !permissions || !Array.isArray(permissions)) {
      return new Response(
        JSON.stringify({ error: 'appName and permissions array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a security analyst translating technical API permissions into plain English warnings for non-technical users. Be calm, clear, and non-alarmist unless the risk is genuinely high.

Rules:
- Explain what the app CAN do with each permission
- Mention what it CANNOT do (to reassure users)
- Assess risk level: low (read-only data), medium (can read sensitive data), high (can move money or access contacts)
- Keep response under 50 words
- Be factual, not scary

Return JSON: { "warning": "...", "riskLevel": "low|medium|high" }`;

    const userPrompt = `App: ${appName}
Permissions: ${permissions.join(', ')}

Translate these permissions into a user-friendly warning with risk assessment.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      // Return fallback response
      const riskLevel = permissions.some(p => 
        p.includes('send') || p.includes('transfer') || p.includes('payment')
      ) ? 'high' : permissions.length > 3 ? 'medium' : 'low';
      
      return new Response(
        JSON.stringify({
          warning: `${appName} has access to ${permissions.length} permissions. Review connected apps regularly for security.`,
          riskLevel,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // If JSON parsing fails, extract from text
      result = {
        warning: content.slice(0, 200),
        riskLevel: content.toLowerCase().includes('high') ? 'high' : 
                   content.toLowerCase().includes('medium') ? 'medium' : 'low'
      };
    }

    console.log(`Translated permissions for ${appName}:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate-permissions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        warning: 'Unable to analyze permissions. Please review manually.',
        riskLevel: 'medium'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
