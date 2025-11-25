const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoachRequest {
  mode: 'approval-power' | 'forensic-scan' | 'limit-lift' | 'inquiry-detective';
  data: {
    score?: number;
    goalType?: string;
    utilization?: number;
    accountAge?: number;
    currentLimit?: number;
    paymentHistory?: string;
    inquiryCode?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, data } = await req.json() as CoachRequest;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (mode) {
      case 'approval-power':
        systemPrompt = 'You are a credit expert analyzing approval odds for financial products. Provide clear, realistic assessments based on credit scores and market data.';
        userPrompt = `Analyze approval odds for a ${data.goalType} with a credit score of ${data.score}. Include:
1. Approval likelihood (Low/Medium/High)
2. Estimated APR range
3. Top 3 recommended lenders
4. Tips to improve odds

Keep response under 150 words.`;
        break;

      case 'forensic-scan':
        systemPrompt = 'You are a credit analyst providing plain-English explanations of credit reports. Focus on actionable insights.';
        userPrompt = `Analyze a credit profile:
- Score: ${data.score}
- Utilization: ${data.utilization}%
- Average Account Age: ${data.accountAge} years

Identify the single biggest factor dragging down the score and provide one specific action to improve it. Under 100 words.`;
        break;

      case 'limit-lift':
        systemPrompt = 'You are a customer service coach helping users request credit limit increases. Provide professional, persuasive scripts.';
        userPrompt = `Generate a word-for-word script to call a bank and request a credit limit increase:
- Current Limit: $${data.currentLimit}
- Payment History: ${data.paymentHistory}

Include:
1. Opening greeting
2. Reason for request (focus on payment history)
3. Specific amount to request
4. Best time to call (hint: weekday mornings)

Format as a conversational script under 150 words.`;
        break;

      case 'inquiry-detective':
        systemPrompt = 'You are a credit inquiry decoder. Translate cryptic bank codes into clear merchant names and explain why the inquiry appeared.';
        userPrompt = `Decode this credit inquiry code: "${data.inquiryCode}"

Provide:
1. Full merchant/company name
2. Why this inquiry likely appeared
3. Whether it's a hard or soft inquiry

Keep response under 75 words.`;
        break;

      default:
        throw new Error('Invalid mode');
    }

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
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const result = aiData.choices?.[0]?.message?.content || 'No response generated';

    // Extract metadata for approval-power mode
    let metadata: Record<string, any> | undefined;
    if (mode === 'approval-power') {
      const oddsMatch = result.match(/\b(Low|Medium|High)\b/i);
      metadata = { odds: oddsMatch?.[1] || 'Unknown' };
    }

    return new Response(
      JSON.stringify({ result, metadata }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Credit Coach error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
