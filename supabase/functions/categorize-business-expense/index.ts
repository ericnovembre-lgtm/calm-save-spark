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

    const { description, amount } = await req.json();

    // Use Lovable AI to categorize the expense
    const prompt = `Categorize this business expense into one of these categories: office_supplies, equipment, travel, meals, utilities, rent, insurance, professional_services, marketing, software, payroll, other.

Expense: "${description}"
Amount: $${amount}

Respond with ONLY the category name and whether it's tax deductible (true/false), in this format:
category: <category_name>
tax_deductible: <true/false>`;

    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
      }),
    });

    const aiData = await aiResponse.json();
    const aiText = aiData.choices?.[0]?.message?.content || '';

    // Parse AI response
    const categoryMatch = aiText.match(/category:\s*(\w+)/i);
    const deductibleMatch = aiText.match(/tax_deductible:\s*(true|false)/i);

    const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'other';
    const taxDeductible = deductibleMatch ? deductibleMatch[1].toLowerCase() === 'true' : false;

    console.log('Categorization result:', { category, taxDeductible, aiText });

    return new Response(
      JSON.stringify({
        category,
        tax_deductible: taxDeductible,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in categorize-business-expense:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
