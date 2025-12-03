const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CoachRequest {
  mode: 'approval-power' | 'forensic-scan' | 'limit-lift' | 'inquiry-detective' | 'dispute-wizard' | 'azeo-strategist' | 'goodwill-ghostwriter' | 'closure-simulator';
  data: {
    score?: number;
    goalType?: string;
    utilization?: number;
    accountAge?: number;
    currentLimit?: number;
    paymentHistory?: string;
    inquiryCode?: string;
    disputeType?: string;
    accountName?: string;
    cardLimits?: number[];
    creditorName?: string;
    circumstanceType?: string;
    lateDays?: string;
    additionalContext?: string;
    cardAge?: number;
    cardLimit?: number;
    totalCreditLimit?: number;
    avgAccountAge?: number;
    numAccounts?: number;
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

      case 'dispute-wizard':
        systemPrompt = 'You are a consumer rights expert specializing in credit report disputes under the Fair Credit Reporting Act (FCRA). Generate formal, legally-sound dispute letters.';
        userPrompt = `Draft a formal credit bureau dispute letter for:
- Error Type: ${data.disputeType}
- Account/Item: ${data.accountName || 'Not specified'}

Requirements:
1. Reference specific FCRA sections (§611, §623)
2. Include formal letter structure (date, addresses, subject line)
3. Cite the consumer's legal right to dispute
4. Request investigation within 30 days per FCRA requirements
5. Request deletion if unverifiable

Make it professional, assertive, and ready to mail. ~250 words.`;
        break;

      case 'azeo-strategist':
        const limits = data.cardLimits || [];
        const totalLimit = limits.reduce((a, b) => a + b, 0);
        const onePercent = Math.round(totalLimit * 0.01);
        
        systemPrompt = 'You are a credit optimization expert who understands advanced scoring algorithms. Explain the AZEO method clearly.';
        userPrompt = `Analyze for AZEO (All Zero Except One) strategy:
- Card Limits: ${limits.map((l, i) => `Card ${i+1}: $${l}`).join(', ')}
- Total Available Credit: $${totalLimit}
- Target 1% Utilization: $${onePercent}

Provide:
1. Brief explanation of why AZEO works (scoring algorithms treat 0% differently than 1%)
2. Which card to use (recommend the one with highest limit)
3. Exact dollar amount to leave as statement balance: $${onePercent}
4. Timeline: When to do this before a mortgage application
5. Warning: Don't do this if carrying actual debt

Keep it actionable and under 150 words.`;
        break;

      case 'goodwill-ghostwriter':
        systemPrompt = 'You are a consumer advocate skilled at writing persuasive, humble goodwill letters to creditors. Focus on human connection, taking responsibility, and politely requesting forgiveness.';
        userPrompt = `Draft a goodwill adjustment letter to ${data.creditorName}:
- Reason for late payment: ${data.circumstanceType}
- How late: ${data.lateDays} days
- Additional context: ${data.additionalContext || 'None provided'}

Requirements:
1. Open with gratitude for being a loyal customer
2. Take responsibility - DO NOT make excuses
3. Briefly explain the extenuating circumstance
4. Emphasize it was a one-time situation
5. Highlight positive payment history before/after
6. Politely request removal as a goodwill gesture
7. Professional but warm tone

~200 words, ready to mail.`;
        break;

      case 'closure-simulator':
        systemPrompt = 'You are a credit scoring expert who understands FICO score composition. Analyze closure scenarios with data-driven predictions.';
        userPrompt = `Analyze closing this credit card:
- Card Age: ${data.cardAge} years
- Card Limit: $${data.cardLimit}
- Total Credit Limit (all cards): $${data.totalCreditLimit}
- Current Average Account Age: ${data.avgAccountAge} years
- Number of Open Accounts: ${data.numAccounts}

Calculate and explain:
1. New Average Account Age after closure (if this card is removed)
2. New Utilization Rate (assuming $0 balance on closed card)
3. Impact on "Credit Mix" factor
4. Predicted Score Impact: "Safe to Close", "Moderate Risk (-5 to -20 pts)", or "High Risk (>20 pts drop)"
5. RECOMMENDATION with reasoning

Be specific with numbers. Under 150 words.`;
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
        model: 'google/gemini-3-pro',
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
