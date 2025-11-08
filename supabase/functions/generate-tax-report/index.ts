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

    const { year, quarter } = await req.json();

    // Calculate date range
    let startDate: Date, endDate: Date;
    
    if (quarter) {
      const quarterMonth = (quarter - 1) * 3;
      startDate = new Date(year, quarterMonth, 1);
      endDate = new Date(year, quarterMonth + 3, 0);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    console.log('Generating tax report for:', { year, quarter, startDate, endDate });

    // Fetch all business expenses for the period
    const { data: expenses, error: expensesError } = await supabaseClient
      .from('business_expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('expense_date', startDate.toISOString())
      .lte('expense_date', endDate.toISOString());

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
      throw expensesError;
    }

    // Group by tax category
    const categoryTotals: Record<string, { total: number; deductible: number; count: number }> = {};
    let totalExpenses = 0;
    let totalDeductible = 0;

    expenses?.forEach((expense) => {
      const category = expense.tax_category || 'other';
      if (!categoryTotals[category]) {
        categoryTotals[category] = { total: 0, deductible: 0, count: 0 };
      }
      
      const amount = parseFloat(expense.amount);
      categoryTotals[category].total += amount;
      categoryTotals[category].count += 1;
      totalExpenses += amount;

      if (expense.tax_deductible) {
        categoryTotals[category].deductible += amount;
        totalDeductible += amount;
      }
    });

    const report = {
      period: {
        year,
        quarter: quarter || null,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalExpenses,
        totalDeductible,
        deductiblePercentage: totalExpenses > 0 ? (totalDeductible / totalExpenses) * 100 : 0,
        expenseCount: expenses?.length || 0,
      },
      categorySummary: Object.entries(categoryTotals).map(([category, data]) => ({
        category,
        total: data.total,
        deductible: data.deductible,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      })),
      expenses: expenses || [],
    };

    console.log('Tax report generated:', report.summary);

    return new Response(
      JSON.stringify(report),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in generate-tax-report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
