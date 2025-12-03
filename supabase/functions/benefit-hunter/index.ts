import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BenefitMatch {
  benefitId: string;
  confidence: number;
  reason: string;
}

interface AIResponse {
  matches: BenefitMatch[];
  actionableMessage: string;
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Running Benefit Hunter for user: ${user.id}`);

    // 1. Fetch recent card transactions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: transactions, error: txError } = await supabase
      .from('card_transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_date', sevenDaysAgo.toISOString())
      .order('transaction_date', { ascending: false });

    if (txError) {
      console.error('Error fetching transactions:', txError);
      throw txError;
    }

    console.log(`Found ${transactions?.length || 0} recent transactions`);

    // 2. Fetch user's card tier
    const { data: tierData } = await supabase
      .from('card_tier_status')
      .select('current_tier')
      .eq('user_id', user.id)
      .single();

    const userTier = tierData?.current_tier || 'basic';

    // 3. Fetch active card benefits for user's tier
    const { data: benefits, error: benefitsError } = await supabase
      .from('card_benefits')
      .select('*')
      .eq('is_active', true)
      .or(`card_tier.eq.${userTier},card_tier.eq.basic`); // Include basic tier benefits for all users

    if (benefitsError) {
      console.error('Error fetching benefits:', benefitsError);
      throw benefitsError;
    }

    console.log(`Found ${benefits?.length || 0} applicable benefits for tier: ${userTier}`);

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No recent transactions to analyze', newMatches: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let newMatches = 0;

    // 4. For each transaction, find matching benefits
    for (const transaction of transactions) {
      console.log(`Analyzing transaction: ${transaction.merchant_name} - $${Math.abs(transaction.amount_cents) / 100}`);

      // Check if we already matched this transaction
      const { data: existingMatch } = await supabase
        .from('benefit_matches')
        .select('id')
        .eq('transaction_id', transaction.id)
        .maybeSingle();

      if (existingMatch) {
        console.log('Transaction already matched, skipping');
        continue;
      }

      const matchingBenefits = benefits?.filter(benefit => {
        // Check amount threshold
        if (benefit.trigger_min_amount_cents && Math.abs(transaction.amount_cents) < benefit.trigger_min_amount_cents) {
          return false;
        }

        // Check merchant category
        if (benefit.trigger_merchant_categories && benefit.trigger_merchant_categories.length > 0) {
          const categoryMatch = benefit.trigger_merchant_categories.some((cat: string) =>
            transaction.merchant_category?.toLowerCase().includes(cat.toLowerCase())
          );
          if (categoryMatch) return true;
        }

        // Check keywords in merchant name
        if (benefit.trigger_keywords && benefit.trigger_keywords.length > 0) {
          const keywordMatch = benefit.trigger_keywords.some((keyword: string) =>
            transaction.merchant_name.toLowerCase().includes(keyword.toLowerCase())
          );
          if (keywordMatch) return true;
        }

        return false;
      });

      if (matchingBenefits && matchingBenefits.length > 0) {
        console.log(`Found ${matchingBenefits.length} matching benefits`);

        // Use AI to enhance matching and generate actionable message
        for (const benefit of matchingBenefits) {
          const prompt = `You are a credit card benefits analyst. Analyze this transaction and benefit match:

Transaction:
- Merchant: ${transaction.merchant_name}
- Category: ${transaction.merchant_category || 'Unknown'}
- Amount: $${Math.abs(transaction.amount_cents) / 100}
- Date: ${transaction.transaction_date}

Benefit:
- Name: ${benefit.benefit_name}
- Description: ${benefit.description}
- Activation Required: ${benefit.activation_required ? 'Yes' : 'No'}

Generate a personalized, actionable message (2-3 sentences) for the user about this benefit. 
Be specific, friendly, and include urgency if applicable. 
Also rate the match confidence (0.0-1.0) and urgency level (low/medium/high).

Return ONLY valid JSON in this format:
{
  "confidence": 0.95,
  "actionableMessage": "Your message here",
  "urgency": "medium"
}`;

          try {
            // Call Lovable AI
            const aiResponse = await fetch('https://api.lovable.app/v1/ai/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-3-pro',
                messages: [
                  { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_completion_tokens: 500,
              }),
            });

            if (!aiResponse.ok) {
              console.error('AI API error:', await aiResponse.text());
              throw new Error('AI API request failed');
            }

            const aiData = await aiResponse.json();
            const aiContent = aiData.choices[0]?.message?.content || '{}';
            
            // Parse AI response
            let aiResult: AIResponse;
            try {
              aiResult = JSON.parse(aiContent);
            } catch {
              // Fallback if AI doesn't return valid JSON
              aiResult = {
                matches: [],
                actionableMessage: `You recently made a purchase at ${transaction.merchant_name}. Don't forget to take advantage of your ${benefit.benefit_name} benefit!`,
                urgency: 'medium',
                confidence: 0.8
              };
            }

            const confidence = aiResult.confidence || 0.8;
            const message = aiResult.actionableMessage || benefit.description;

            // Calculate expiry date
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + (benefit.validity_days || 30));

            // Create benefit match
            const { error: matchError } = await supabase
              .from('benefit_matches')
              .insert({
                user_id: user.id,
                transaction_id: transaction.id,
                benefit_id: benefit.id,
                match_confidence: confidence,
                status: 'pending',
                expires_at: expiresAt.toISOString(),
              });

            if (matchError) {
              console.error('Error creating benefit match:', matchError);
              continue;
            }

            // Create agent nudge
            const { error: nudgeError } = await supabase
              .from('agent_nudges')
              .insert({
                user_id: user.id,
                agent_type: 'benefit_hunter',
                nudge_type: benefit.benefit_category,
                message: message,
                priority: aiResult.urgency === 'high' ? 3 : aiResult.urgency === 'medium' ? 2 : 1,
                action_url: benefit.activation_url,
                trigger_data: {
                  transaction_id: transaction.id,
                  benefit_id: benefit.id,
                  merchant: transaction.merchant_name,
                  amount: Math.abs(transaction.amount_cents) / 100,
                },
                expires_at: expiresAt.toISOString(),
              });

            if (nudgeError) {
              console.error('Error creating nudge:', nudgeError);
            }

            newMatches++;
            console.log(`Created benefit match: ${benefit.benefit_name}`);
          } catch (aiError) {
            console.error('Error with AI processing:', aiError);
            // Continue with next benefit even if AI fails
          }
        }
      }
    }

    console.log(`Benefit Hunter completed. Created ${newMatches} new matches`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        newMatches,
        message: `Found ${newMatches} new benefit(s) for you!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in benefit-hunter:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
