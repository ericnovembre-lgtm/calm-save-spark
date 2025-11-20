import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ABTest {
  id: string;
  model_a: string;
  model_b: string;
  traffic_split: number;
}

export async function getActiveABTest(
  supabase: SupabaseClient,
  agentType: string
): Promise<ABTest | null> {
  const { data, error } = await supabase
    .from('ai_model_ab_tests')
    .select('id, model_a, model_b, traffic_split')
    .eq('agent_type', agentType)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export function selectModelForTest(test: ABTest): { model: string; testId: string } {
  const random = Math.random();
  const model = random < test.traffic_split ? test.model_a : test.model_b;
  return { model, testId: test.id };
}

export async function logTestResult(
  supabase: SupabaseClient,
  params: {
    testId: string;
    userId: string;
    agentType: string;
    modelUsed: string;
    conversationId?: string;
    responseTimeMs?: number;
    tokenCount?: number;
    metadata?: Record<string, any>;
  }
) {
  const { error } = await supabase
    .from('ai_model_test_results')
    .insert({
      test_id: params.testId,
      user_id: params.userId,
      agent_type: params.agentType,
      model_used: params.modelUsed,
      conversation_id: params.conversationId,
      response_time_ms: params.responseTimeMs,
      token_count: params.tokenCount,
      metadata: params.metadata || {},
    });

  if (error) {
    console.error('Error logging A/B test result:', error);
  }
}
