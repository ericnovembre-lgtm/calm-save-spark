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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active users with recent activity
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(100);

    if (usersError) throw usersError;

    let nudgesCreated = 0;

    for (const user of users || []) {
      // Check budget spending
      const { data: budgets } = await supabase
        .from('user_budgets')
        .select('*, budget_spending(*)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      for (const budget of budgets || []) {
        const spending = budget.budget_spending?.[0];
        if (spending && spending.spent_amount) {
          const percentage = (spending.spent_amount / budget.limit_amount) * 100;
          
          if (percentage >= 85 && percentage < 100) {
            await supabase.from('agent_nudges').insert({
              user_id: user.id,
              agent_type: 'financial_coach',
              nudge_type: 'budget_warning',
              message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. Consider slowing down spending.`,
              priority: 2,
              action_url: '/budgets',
              trigger_data: { budgetId: budget.id, percentage },
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            });
            nudgesCreated++;
          }
        }
      }

      // Check upcoming bills
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data: bills } = await supabase
        .from('recurring_bills')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('next_due_date', tomorrow.toISOString().split('T')[0]);

      for (const bill of bills || []) {
        await supabase.from('agent_nudges').insert({
          user_id: user.id,
          agent_type: 'financial_coach',
          nudge_type: 'bill_reminder',
          message: `${bill.bill_name} of $${bill.amount} is due tomorrow. Make sure you have sufficient funds.`,
          priority: 3,
          action_url: '/bills',
          trigger_data: { billId: bill.id },
          expires_at: tomorrow.toISOString()
        });
        nudgesCreated++;
      }

      // Check goal progress
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      for (const goal of goals || []) {
        const progress = (goal.current_amount / goal.target_amount) * 100;
        
        // Encourage when close to milestone
        if (progress >= 90 && progress < 100) {
          await supabase.from('agent_nudges').insert({
            user_id: user.id,
            agent_type: 'financial_coach',
            nudge_type: 'goal_encouragement',
            message: `You're ${(100 - progress).toFixed(0)}% away from reaching "${goal.name}"! Just $${(goal.target_amount - goal.current_amount).toFixed(2)} to go!`,
            priority: 1,
            action_url: `/goals/${goal.id}`,
            trigger_data: { goalId: goal.id, progress },
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
          nudgesCreated++;
        }
      }

      // Check for savings inactivity
      const { data: recentTransfers } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', user.id)
        .eq('transfer_type', 'deposit')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (!recentTransfers || recentTransfers.length === 0) {
        await supabase.from('agent_nudges').insert({
          user_id: user.id,
          agent_type: 'financial_coach',
          nudge_type: 'savings_opportunity',
          message: "You haven't saved in a week. Even $5 adds up! Make a quick transfer?",
          priority: 1,
          action_url: '/dashboard',
          trigger_data: { daysInactive: 7 },
          expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        });
        nudgesCreated++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        nudgesCreated,
        usersProcessed: users?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Nudge generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
