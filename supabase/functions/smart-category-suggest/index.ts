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
    const { merchantName, amount, description } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      }
    });

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Check cache first
    const { data: cachedSuggestion } = await supabase
      .from('category_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .ilike('merchant_name', `%${merchantName}%`)
      .order('times_used', { ascending: false })
      .limit(1)
      .single();

    if (cachedSuggestion && cachedSuggestion.confidence_score > 0.7) {
      // Update usage count
      await supabase
        .from('category_suggestions')
        .update({ times_used: cachedSuggestion.times_used + 1 })
        .eq('id', cachedSuggestion.id);

      return new Response(
        JSON.stringify({
          categoryCode: cachedSuggestion.suggested_category_code,
          confidence: cachedSuggestion.confidence_score,
          source: 'cache'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's historical data for context
    const { data: userCategories } = await supabase
      .from('budget_categories')
      .select('code, name')
      .or(`is_custom.eq.false,user_id.eq.${user.id}`)
      .order('is_custom', { ascending: true });

    // Use Lovable AI for smart suggestion
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a financial categorization expert. Based on merchant name, amount, and description, suggest the most appropriate budget category.

Available categories:
${userCategories?.map(c => `- ${c.code}: ${c.name}`).join('\n')}

Return only a JSON object with: categoryCode, confidence (0-1), reasoning`;

    const userPrompt = `Categorize this transaction:
Merchant: ${merchantName}
Amount: $${amount}
Description: ${description || 'N/A'}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const suggestion = JSON.parse(aiData.choices[0].message.content);

    // Cache the suggestion
    await supabase
      .from('category_suggestions')
      .insert({
        user_id: user.id,
        merchant_name: merchantName,
        amount_range: amount < 50 ? 'low' : amount < 200 ? 'medium' : 'high',
        suggested_category_code: suggestion.categoryCode,
        confidence_score: suggestion.confidence,
        times_used: 1
      });

    return new Response(
      JSON.stringify({
        categoryCode: suggestion.categoryCode,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning,
        source: 'ai'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in smart-category-suggest:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
