import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { EdgeFunctionCache } from '../_shared/edge-cache.ts';
import { callLovableAI } from '../_shared/lovable-ai-fallback.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize cache with 10-minute TTL for insights
const insightsCache = new EdgeFunctionCache({ 
  maxEntries: 100, 
  defaultTTL: 600 // 10 minutes
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first
    const cacheKey = `insights:${userId}`;
    const cached = insightsCache.get(cacheKey);
    if (cached) {
      console.log(`[generate-insights] Cache HIT for user ${userId}`);
      return new Response(
        JSON.stringify(cached),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-TTL': '600'
          } 
        }
      );
    }

    console.log(`[generate-insights] Cache MISS for user ${userId}`);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', thirtyDaysAgo.toISOString())
      .order('transaction_date', { ascending: false });

    if (txError) throw txError;

    // AI call is handled by shared utility (LOVABLE_API_KEY check is in callLovableAI)

    // Prepare transaction summary
    const totalSpent = transactions?.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;
    const categoryBreakdown = transactions?.reduce((acc: Record<string, number>, tx) => {
      const cat = tx.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + parseFloat(tx.amount.toString());
      return acc;
    }, {});

    const topCategories = Object.entries(categoryBreakdown || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3);

    const prompt = `Analyze this user's spending for the last 30 days and generate 3-5 actionable insights:

Total spent: $${totalSpent.toFixed(2)}
Transaction count: ${transactions?.length || 0}
Top spending categories: ${topCategories.map(([cat, amt]) => `${cat}: $${(amt as number).toFixed(2)}`).join(', ')}

Generate insights in these categories:
1. TREND: Spending patterns vs previous periods (e.g., "20% more on dining")
2. ALERT: Unusual charges or price changes (e.g., "Netflix $2 higher than usual")
3. UPCOMING: Predicted recurring charges in next 7 days
4. TIP: Money-saving opportunities (e.g., "Switch internet for $45/month savings")

Format as JSON array with structure:
{
  "insights": [
    {
      "type": "trend|alert|upcoming|tip",
      "title": "Brief title",
      "description": "Detailed insight (max 80 chars)",
      "severity": "info|warning|critical",
      "actionLabel": "Optional CTA text"
    }
  ]
}`;

    // Use shared Lovable AI utility for consistent error handling
    let content: string;
    try {
      const aiResponse = await callLovableAI(
        [
          { role: 'system', content: 'You are a financial insights assistant. Generate concise, actionable insights.' },
          { role: 'user', content: prompt }
        ],
        {
          model: 'google/gemini-2.5-flash',
          temperature: 0.7,
        }
      );

      const aiData = await aiResponse.json();
      content = aiData.choices[0].message.content;
    } catch (aiError) {
      console.error('[generate-insights] AI call failed:', aiError);
      
      // Return fallback insights
      return new Response(
        JSON.stringify({
          insights: [
            {
              id: '1',
              type: 'trend',
              title: 'Spending Summary',
              description: `You've spent $${totalSpent.toFixed(2)} across ${transactions?.length || 0} transactions this month`,
              severity: 'info',
            }
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Add unique IDs
    const insights = parsed.insights.map((insight: any, i: number) => ({
      ...insight,
      id: `${Date.now()}-${i}`,
    }));

    const responseData = { insights };
    
    // Cache the successful response
    insightsCache.set(cacheKey, responseData);
    console.log(`[generate-insights] Cached response for user ${userId}`);

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
          'X-Cache-TTL': '600'
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        insights: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
