const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing notification rules from:', prompt);

    const response = await fetch('https://api.lovable.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a notification preference parser. Convert natural language into structured notification rules.
            
Output ONLY valid JSON with this exact structure:
{
  "notify_overdraft": boolean,
  "bill_threshold": number (0 means all bills),
  "notify_marketing": boolean,
  "notify_goals": boolean,
  "notify_achievements": boolean,
  "notify_weekly_digest": boolean
}

Examples:
Input: "Only notify me if I'm about to overdraft or if a bill is over $200"
Output: {"notify_overdraft":true,"bill_threshold":200,"notify_marketing":false,"notify_goals":false,"notify_achievements":false,"notify_weekly_digest":false}

Input: "I want everything except marketing"
Output: {"notify_overdraft":true,"bill_threshold":0,"notify_marketing":false,"notify_goals":true,"notify_achievements":true,"notify_weekly_digest":true}

Input: "Minimal notifications"
Output: {"notify_overdraft":true,"bill_threshold":100,"notify_marketing":false,"notify_goals":false,"notify_achievements":false,"notify_weekly_digest":false}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI raw response:', aiResponse);

    // Parse the JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse notification rules from AI response');
    }

    const rules = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ rules }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parse-notification-rules:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
