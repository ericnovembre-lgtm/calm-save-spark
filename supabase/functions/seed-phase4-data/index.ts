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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    console.log('Seeding Phase 4 test data for user:', user.id);

    // 1. Seed User Behavior Patterns (5 patterns)
    const behaviorPatterns = [
      {
        user_id: user.id,
        pattern_type: 'spending_time',
        pattern_data: {
          peak_hours: [14, 15, 16],
          peak_days: ['Saturday', 'Sunday'],
          description: 'Peak spending on weekends at 2-4pm'
        },
        confidence_score: 0.85,
        pattern_frequency: 'weekly',
        last_observed: new Date().toISOString(),
        metadata: { category: 'temporal', sample_size: 120 }
      },
      {
        user_id: user.id,
        pattern_type: 'category_preference',
        pattern_data: {
          top_categories: ['Dining', 'Entertainment', 'Shopping'],
          percentages: [35, 28, 22],
          description: 'Prefers dining and entertainment spending'
        },
        confidence_score: 0.92,
        pattern_frequency: 'monthly',
        last_observed: new Date().toISOString(),
        metadata: { total_transactions: 450 }
      },
      {
        user_id: user.id,
        pattern_type: 'savings_behavior',
        pattern_data: {
          average_amount: 250,
          frequency: 'biweekly',
          consistency: 0.78,
          description: 'Saves $250 every two weeks'
        },
        confidence_score: 0.88,
        pattern_frequency: 'biweekly',
        last_observed: new Date().toISOString(),
        metadata: { streak: 12 }
      },
      {
        user_id: user.id,
        pattern_type: 'income_timing',
        pattern_data: {
          paycheck_days: [1, 15],
          amount_pattern: 'consistent',
          description: 'Receives income on 1st and 15th of month'
        },
        confidence_score: 0.95,
        pattern_frequency: 'biweekly',
        last_observed: new Date().toISOString(),
        metadata: { source: 'direct_deposit' }
      },
      {
        user_id: user.id,
        pattern_type: 'impulse_spending',
        pattern_data: {
          triggers: ['weekend', 'late_night', 'stress'],
          average_amount: 75,
          frequency_per_month: 4,
          description: 'Impulse purchases on stressed weekends'
        },
        confidence_score: 0.72,
        pattern_frequency: 'weekly',
        last_observed: new Date().toISOString(),
        metadata: { category: 'behavioral' }
      }
    ];

    const { error: patternsError } = await supabase
      .from('user_behavior_patterns')
      .upsert(behaviorPatterns, { onConflict: 'user_id,pattern_type' });

    if (patternsError) throw patternsError;

    // 2. Seed Learning Events (10 events)
    const learningEvents = [];
    const eventTypes = ['prediction_feedback', 'model_accuracy', 'pattern_validation'];
    const outcomes = ['correct', 'incorrect', 'partially_correct'];

    for (let i = 0; i < 10; i++) {
      learningEvents.push({
        user_id: user.id,
        event_type: eventTypes[i % 3],
        event_data: {
          prediction: `prediction_${i}`,
          actual_outcome: outcomes[i % 3],
          accuracy_score: 0.6 + (Math.random() * 0.3),
          model_version: '1.0'
        },
        learning_outcome: {
          improved: i % 2 === 0,
          adjustment: Math.random() * 0.1,
          confidence_delta: (Math.random() - 0.5) * 0.2
        },
        processed: true,
        created_at: new Date(Date.now() - (i * 86400000)).toISOString()
      });
    }

    const { error: eventsError } = await supabase
      .from('learning_events')
      .insert(learningEvents);

    if (eventsError) throw eventsError;

    // 3. Seed Financial Anomalies (4 anomalies)
    const anomalies = [
      {
        user_id: user.id,
        anomaly_type: 'unusual_spending',
        severity: 'high',
        description: 'Spending 150% above normal in Dining category',
        detected_data: {
          category: 'Dining',
          normal_amount: 500,
          actual_amount: 750,
          deviation: 1.5,
          timeframe: 'last_7_days'
        },
        confidence_score: 0.89,
        potential_impact: 375,
        suggested_action: 'Review recent dining expenses and consider budget adjustment',
        status: 'active',
        metadata: { affected_budget: 'dining', alert_priority: 'high' }
      },
      {
        user_id: user.id,
        anomaly_type: 'missed_recurring',
        severity: 'medium',
        description: 'Expected recurring subscription payment not detected',
        detected_data: {
          merchant: 'Netflix',
          expected_amount: 15.99,
          last_payment: '2024-11-15',
          days_overdue: 5
        },
        confidence_score: 0.92,
        potential_impact: 15.99,
        suggested_action: 'Check if subscription is still active or payment method needs updating',
        status: 'active',
        metadata: { subscription_id: 'netflix_monthly' }
      },
      {
        user_id: user.id,
        anomaly_type: 'duplicate_transaction',
        severity: 'low',
        description: 'Potential duplicate charge detected',
        detected_data: {
          merchant: 'Amazon',
          amount: 45.99,
          transaction_count: 2,
          time_diff_minutes: 3
        },
        confidence_score: 0.75,
        potential_impact: 45.99,
        suggested_action: 'Review transactions and contact merchant if duplicate',
        status: 'active',
        metadata: { review_required: true }
      },
      {
        user_id: user.id,
        anomaly_type: 'large_withdrawal',
        severity: 'critical',
        description: 'Large cash withdrawal detected - 300% above normal',
        detected_data: {
          amount: 600,
          normal_withdrawal: 200,
          location: 'ATM_Downtown',
          time: new Date().toISOString()
        },
        confidence_score: 0.95,
        potential_impact: 600,
        suggested_action: 'Verify this withdrawal was authorized',
        status: 'active',
        metadata: { security_flag: true, requires_confirmation: true }
      }
    ];

    const { error: anomaliesError } = await supabase
      .from('financial_anomalies')
      .insert(anomalies);

    if (anomaliesError) throw anomaliesError;

    // 4. Seed Digital Twin State
    const digitalTwin = {
      user_id: user.id,
      twin_version: 1,
      personality_profile: {
        risk_profile: 'moderate_conservative',
        time_horizon: 'medium_term',
        financial_knowledge: 'intermediate',
        goal_orientation: 'balanced',
        spending_personality: 'mindful_spender',
        savings_mindset: 'consistent_saver'
      },
      risk_tolerance: 0.65,
      savings_propensity: 0.72,
      impulse_factor: 0.35,
      financial_goals_alignment: 0.80,
      last_calibrated_at: new Date().toISOString(),
      calibration_accuracy: 0.87
    };

    const { error: twinError } = await supabase
      .from('digital_twin_state')
      .upsert(digitalTwin, { onConflict: 'user_id' });

    if (twinError) throw twinError;

    console.log('Successfully seeded Phase 4 test data');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Phase 4 test data seeded successfully',
        summary: {
          behavior_patterns: behaviorPatterns.length,
          learning_events: learningEvents.length,
          financial_anomalies: anomalies.length,
          digital_twin: 1
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error seeding Phase 4 data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
