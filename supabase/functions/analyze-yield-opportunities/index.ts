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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all accounts
    const { data: accounts } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id);

    const checkingAccounts = accounts?.filter(a => a.account_type === 'checking') || [];
    const savingsAccounts = accounts?.filter(a => a.account_type === 'savings') || [];

    const opportunities = [];

    for (const checking of checkingAccounts) {
      const checkingBalance = checking.current_balance || checking.balance || 0;
      const checkingAPY = checking.apy || 0.01;

      for (const savings of savingsAccounts) {
        const savingsAPY = savings.apy || 0.01;

        // Check if there's significant balance and APY difference
        if (checkingBalance > 3000 && savingsAPY > 4.0) {
          const amountToTransfer = checkingBalance - 2000; // Keep $2K buffer
          const potentialEarnings = amountToTransfer * ((savingsAPY - checkingAPY) / 100);

          if (potentialEarnings > 50) {
            opportunities.push({
              fromAccount: checking.id,
              fromName: checking.institution_name,
              toAccount: savings.id,
              toName: savings.institution_name,
              amount: amountToTransfer,
              annualEarnings: potentialEarnings,
              savingsAPY,
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ opportunities }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-yield-opportunities:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});