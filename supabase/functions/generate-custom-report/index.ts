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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { reportId, reportConfig } = await req.json();
    const { report_type, date_range, filters } = reportConfig;

    console.log('Generating custom report:', report_type, date_range);

    let data = [];
    const { start_date, end_date } = date_range;

    // Fetch data based on report type
    switch (report_type) {
      case 'spending':
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', start_date)
          .lte('date', end_date)
          .order('date', { ascending: true });
        
        data = transactions || [];
        break;

      case 'savings':
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id);
        
        data = goals || [];
        break;

      case 'goals':
        const { data: goalProgress } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        data = goalProgress || [];
        break;

      case 'debts':
        const { data: debts } = await supabase
          .from('debts')
          .select('*')
          .eq('user_id', user.id)
          .order('current_balance', { ascending: false });
        
        data = debts || [];
        break;

      case 'investments':
        const { data: investments } = await supabase
          .from('investment_accounts')
          .select('*')
          .eq('user_id', user.id);
        
        data = investments || [];
        break;

      default:
        throw new Error('Invalid report type');
    }

    // Apply additional filters if provided
    if (filters && Object.keys(filters).length > 0) {
      data = data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          return item[key] === value;
        });
      });
    }

    // Calculate summary statistics
    const summary = {
      total_records: data.length,
      date_range,
      generated_at: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ data, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});