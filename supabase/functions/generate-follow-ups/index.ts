// Deno edge function

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, filters, resultCount } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `The user searched for: "${query}"
${filters ? `Current filters: ${JSON.stringify(filters)}` : ''}
Found ${resultCount || 0} transactions.

Generate 3-4 natural follow-up questions that help them dig deeper. Examples:
- Comparison: "Compare to last month"
- Expansion: "Show all dining spending this year"
- Analysis: "Which coffee shop was most expensive?"
- Action: "Set a budget for groceries"

Return ONLY a JSON array of strings, no explanation:
["question 1", "question 2", "question 3"]`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You generate natural follow-up questions for transaction searches. Return only JSON array.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI error:', aiResponse.status, await aiResponse.text());
      
      // Return fallback suggestions
      return new Response(
        JSON.stringify({
          suggestions: [
            "Compare to last month",
            "Show category breakdown",
            "Find similar transactions"
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Extract JSON array
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array in AI response');
    }

    const suggestions = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-follow-ups:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
