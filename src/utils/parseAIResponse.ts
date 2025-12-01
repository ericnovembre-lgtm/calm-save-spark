import { ComponentMessage } from "@/components/generative-ui/types";

export interface CoachBrainResponse {
  insight?: string;           // One-sentence summary
  tone?: 'cautionary' | 'celebratory' | 'neutral';
  chartData?: { label: string; value: number }[];
  recommendedActions?: {
    title: string;
    impact: string;
    type: 'arbitrage' | 'waste' | 'opportunity';
  }[];
  uiComponents?: ComponentMessage[]; // Full generative UI
  text?: string; // Plain text fallback
}

/**
 * Parse AI agent response that may contain tool calls (generative UI components)
 * or plain text content
 */
export function parseAIResponse(content: string): CoachBrainResponse {
  const response: CoachBrainResponse = {};

  // Try to parse as JSON (tool call format)
  try {
    const parsed = JSON.parse(content);
    
    // Check if it's a tool call response
    if (parsed.tool_calls || parsed.function_call) {
      const toolCalls = parsed.tool_calls || [parsed.function_call];
      response.uiComponents = toolCalls
        .filter((call: any) => call.function?.name || call.name)
        .map((call: any) => {
          const functionName = call.function?.name || call.name;
          const args = call.function?.arguments || call.arguments;
          
          // Map function names to component types
          const componentTypeMap: Record<string, string> = {
            render_spending_chart: 'spending_chart',
            render_budget_alert: 'budget_alert',
            render_subscription_list: 'subscription_list',
            render_action_card: 'action_card',
            render_goal_builder: 'interactive_goal_builder',
            render_cash_flow_sankey: 'cash_flow_sankey',
            render_net_worth_timeline: 'net_worth_timeline',
            render_financial_health_score: 'financial_health_score',
            render_ai_insights_carousel: 'ai_insights_carousel',
            render_predictive_forecast: 'predictive_forecast',
            render_emotion_aware_response: 'emotion_aware_response',
          };

          return {
            type: componentTypeMap[functionName] || 'action_card',
            props: typeof args === 'string' ? JSON.parse(args) : args,
            fallbackText: `Generated ${functionName}`
          } as ComponentMessage;
        });
    }

    // Extract structured data if present
    if (parsed.insight) response.insight = parsed.insight;
    if (parsed.tone) response.tone = parsed.tone;
    if (parsed.chartData) response.chartData = parsed.chartData;
    if (parsed.recommendedActions) response.recommendedActions = parsed.recommendedActions;
    
  } catch (e) {
    // Not JSON, treat as plain text
    response.text = content;
  }

  return response;
}

/**
 * Extract tone indicators from text content
 */
export function detectTone(text: string): 'cautionary' | 'celebratory' | 'neutral' {
  const lowerText = text.toLowerCase();
  
  const cautionaryKeywords = ['warning', 'careful', 'risk', 'danger', 'caution', 'alert', 'concern'];
  const celebratoryKeywords = ['great', 'excellent', 'congratulations', 'success', 'achievement', 'well done'];
  
  const cautionaryCount = cautionaryKeywords.filter(kw => lowerText.includes(kw)).length;
  const celebratoryCount = celebratoryKeywords.filter(kw => lowerText.includes(kw)).length;
  
  if (cautionaryCount > celebratoryCount) return 'cautionary';
  if (celebratoryCount > cautionaryCount) return 'celebratory';
  return 'neutral';
}
