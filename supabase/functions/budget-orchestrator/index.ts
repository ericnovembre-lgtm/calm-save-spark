import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UI_TOOLS = [
  {
    type: "function",
    function: {
      name: "extract_budget_intent",
      description: "Extract structured budget creation parameters from natural language",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "Budget amount" },
          category: { type: "string", description: "Budget category (e.g., Travel, Dining, Entertainment)" },
          timeframe: { type: "string", enum: ["monthly", "weekly", "yearly"], description: "Budget recurrence" },
          isRecurring: { type: "boolean", description: "Whether this budget repeats" },
          notes: { type: "string", description: "Any additional context or notes" }
        },
        required: ["amount", "category", "timeframe"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "transfer_budget_funds",
      description: "Transfer surplus funds from one budget category to another to cover shortages",
      parameters: {
        type: "object",
        properties: {
          fromCategory: { type: "string", description: "Source budget category name" },
          toCategory: { type: "string", description: "Destination budget category name" },
          amount: { type: "number", description: "Amount to transfer" },
          reason: { type: "string", description: "Reason for the transfer" }
        },
        required: ["fromCategory", "toCategory", "amount"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "adjust_budget_limit",
      description: "Increase or decrease a budget limit by a specific amount or percentage",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Budget category to adjust" },
          adjustment: { type: "number", description: "Amount to adjust (positive for increase, negative for decrease)" },
          isPercentage: { type: "boolean", description: "Whether adjustment is a percentage (true) or fixed amount (false)" }
        },
        required: ["category", "adjustment"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_spending_chart",
      description: "Display a visual chart of spending patterns over time",
      parameters: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                amount: { type: "number" },
                month: { type: "string" }
              }
            }
          },
          timeRange: { type: "string", enum: ["week", "month", "year"] }
        },
        required: ["data"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_budget_alert",
      description: "Show a budget warning or alert when spending is high",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
          spent: { type: "number" },
          limit: { type: "number" },
          severity: { type: "string", enum: ["warning", "danger", "info"] }
        },
        required: ["category", "spent", "limit"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_subscription_list",
      description: "Display active subscriptions with costs",
      parameters: {
        type: "object",
        properties: {
          subscriptions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "number" },
                frequency: { type: "string" },
                nextBillDate: { type: "string" }
              }
            }
          }
        },
        required: ["subscriptions"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_action_card",
      description: "Suggest an actionable step the user can take",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          actionType: { type: "string", enum: ["transfer", "create_goal", "adjust_budget", "review"] },
          actionData: { type: "object" }
        },
        required: ["title", "description", "actionType"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_interactive_goal_builder",
      description: "Interactive wizard to create a financial goal with sliders and date pickers",
      parameters: {
        type: "object",
        properties: {
          suggestedGoals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                targetAmount: { type: "number" },
                timeframe: { type: "string" }
              }
            }
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_cash_flow_sankey",
      description: "Sankey diagram showing money flow between income, expenses, and savings",
      parameters: {
        type: "object",
        properties: {
          income: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source: { type: "string" },
                amount: { type: "number" }
              }
            }
          },
          expenses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                amount: { type: "number" }
              }
            }
          },
          savings: { type: "number" }
        },
        required: ["income", "expenses", "savings"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_net_worth_timeline",
      description: "Animated timeline showing historical and projected net worth",
      parameters: {
        type: "object",
        properties: {
          historical: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                assets: { type: "number" },
                liabilities: { type: "number" }
              }
            }
          },
          projected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                netWorth: { type: "number" }
              }
            }
          }
        },
        required: ["historical"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_financial_health_score",
      description: "Gamified financial health score with category breakdown",
      parameters: {
        type: "object",
        properties: {
          totalScore: { type: "number" },
          categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                score: { type: "number" },
                maxScore: { type: "number" },
                tips: { type: "array", items: { type: "string" } }
              }
            }
          }
        },
        required: ["totalScore", "categories"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_ai_insights_carousel",
      description: "Swipeable cards showing personalized AI insights",
      parameters: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string", enum: ["low", "medium", "high"] },
                actionable: { type: "boolean" }
              }
            }
          }
        },
        required: ["insights"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_predictive_forecast",
      description: "ML-powered spending forecast with confidence intervals",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
          historicalData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string" },
                actual: { type: "number" }
              }
            }
          },
          predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string" },
                predicted: { type: "number" },
                confidence: {
                  type: "object",
                  properties: {
                    lower: { type: "number" },
                    upper: { type: "number" }
                  }
                }
              }
            }
          },
          insights: {
            type: "object",
            properties: {
              trend: { type: "string", enum: ["increasing", "decreasing", "stable"] },
              volatility: { type: "string", enum: ["low", "medium", "high"] },
              anomalies: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } }
            }
          }
        },
        required: ["category", "historicalData", "predictions", "insights"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "render_emotion_aware_response",
      description: "Display response with emotional intelligence and support resources",
      parameters: {
        type: "object",
        properties: {
          detectedEmotion: {
            type: "string",
            enum: ["stressed", "anxious", "excited", "frustrated", "neutral", "hopeful"]
          },
          confidence: { type: "number" },
          response: { type: "string" },
          supportResources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                url: { type: "string" }
              }
            }
          }
        },
        required: ["detectedEmotion", "confidence", "response"]
      }
    }
  }
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { message, conversationId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // Fetch user's budget context
    const { data: budgets } = await supabaseClient
      .from('user_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const { data: spending } = await supabaseClient
      .from('budget_spending')
      .select('*')
      .eq('user_id', user.id);

    const totalBudget = budgets?.reduce((sum, b) => sum + parseFloat(String(b.total_limit)), 0) || 0;
    const totalSpent = spending?.reduce((sum, s) => sum + (s.spent_amount || 0), 0) || 0;
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Build context-aware system prompt
    const systemPrompt = `You are a specialized AI Budget Assistant for $ave+. You help users manage their budgets through natural conversation and dynamic UI components.

Current Budget Context:
- Total monthly budget: $${totalBudget.toFixed(2)}
- Total spent: $${totalSpent.toFixed(2)}
- Budget utilization: ${utilization.toFixed(1)}%
- Active budgets: ${budgets?.length || 0}

Your capabilities:
1. Analyze spending patterns and provide actionable insights
2. Generate interactive visualizations using UI tools
3. Detect user emotions and provide empathetic support
4. Predict future spending trends
5. Suggest budget optimizations
6. Help create savings goals

Important Guidelines:
- Be conversational, friendly, and supportive
- Use UI components to visualize data whenever possible
- Proactively suggest actions based on budget health
- Detect stress/anxiety keywords and offer emotional support
- Keep responses concise (2-3 short paragraphs max)
- Always focus on actionable advice

Available UI Tools:
${UI_TOOLS.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n')}`;

    // Fetch conversation history
    let conversationHistory = [];
    if (conversationId) {
      const { data: conv } = await supabaseClient
        .from('ai_conversations')
        .select('conversation_history')
        .eq('id', conversationId)
        .single();
      
      conversationHistory = (conv?.conversation_history as any) || [];
    }

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        tools: UI_TOOLS,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      if (response.status === 402) {
        throw new Error('PAYMENT_REQUIRED');
      }
      throw new Error('AI Gateway error');
    }

    // Stream response with component extraction
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';
        let toolCalls: any[] = [];

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim() || line.startsWith(':')) continue;
              if (!line.startsWith('data: ')) continue;

              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;

                if (delta?.content) {
                  fullResponse += delta.content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: delta.content })}\n\n`));
                }

                if (delta?.tool_calls) {
                  for (const tc of delta.tool_calls) {
                    // Find existing tool call or create new
                    const existing = toolCalls.find(t => t.index === tc.index);
                    if (existing) {
                      if (tc.function?.arguments) {
                        existing.function.arguments = (existing.function.arguments || '') + tc.function.arguments;
                      }
                    } else {
                      toolCalls.push({
                        index: tc.index,
                        id: tc.id,
                        type: tc.type,
                        function: {
                          name: tc.function?.name || '',
                          arguments: tc.function?.arguments || ''
                        }
                      });
                    }
                  }
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }

          // Process tool calls to generate components or extract intents
          if (toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              const functionName = toolCall.function?.name;
              const functionArgs = JSON.parse(toolCall.function?.arguments || '{}');

              if (functionName === 'extract_budget_intent') {
                // Send budget intent to client for confirmation
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'budget_intent',
                  intent: functionArgs
                })}\n\n`));
              } else if (functionName === 'transfer_budget_funds') {
                // Handle budget transfer action
                try {
                  const { data: fromBudget } = await supabaseClient
                    .from('user_budgets')
                    .select('id, budget_name')
                    .eq('user_id', user.id)
                    .ilike('budget_name', `%${functionArgs.fromCategory}%`)
                    .single();

                  const { data: toBudget } = await supabaseClient
                    .from('user_budgets')
                    .select('id, budget_name')
                    .eq('user_id', user.id)
                    .ilike('budget_name', `%${functionArgs.toCategory}%`)
                    .single();

                  if (fromBudget && toBudget) {
                    const transferResponse = await supabaseClient.functions.invoke('transfer-budget-funds', {
                      body: {
                        from_budget_id: fromBudget.id,
                        to_budget_id: toBudget.id,
                        amount: functionArgs.amount,
                        reason: functionArgs.reason || 'AI-suggested rebalancing'
                      }
                    });

                    if (!transferResponse.error) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'action_success',
                        action: 'transfer',
                        message: `✨ Transferred $${functionArgs.amount.toFixed(2)} from ${fromBudget.budget_name} to ${toBudget.budget_name}`
                      })}\n\n`));
                    }
                  }
                } catch (e) {
                  console.error('Transfer error:', e);
                }
              } else if (functionName === 'adjust_budget_limit') {
                // Handle budget adjustment action
                try {
                  const { data: budget } = await supabaseClient
                    .from('user_budgets')
                    .select('id, budget_name, total_limit')
                    .eq('user_id', user.id)
                    .ilike('budget_name', `%${functionArgs.category}%`)
                    .single();

                  if (budget) {
                    const currentLimit = parseFloat(String(budget.total_limit));
                    const adjustment = functionArgs.isPercentage 
                      ? currentLimit * (functionArgs.adjustment / 100)
                      : functionArgs.adjustment;
                    const newLimit = currentLimit + adjustment;

                    await supabaseClient
                      .from('user_budgets')
                      .update({ total_limit: newLimit })
                      .eq('id', budget.id);

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'action_success',
                      action: 'adjust',
                      message: `✅ Updated ${budget.budget_name} budget from $${currentLimit.toFixed(2)} to $${newLimit.toFixed(2)}`
                    })}\n\n`));
                  }
                } catch (e) {
                  console.error('Adjustment error:', e);
                }
              } else if (functionName) {
                const componentType = functionName.replace('render_', '');
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'component',
                  componentType,
                  props: functionArgs
                })}\n\n`));
              }
            }
          }

          // Update conversation history
          const newHistory = [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: fullResponse }
          ];

          if (conversationId) {
            await supabaseClient
              .from('ai_conversations')
              .update({
                conversation_history: newHistory,
                last_message_at: new Date().toISOString(),
                message_count: newHistory.length
              })
              .eq('id', conversationId);
          } else {
            // Create new conversation
            await supabaseClient
              .from('ai_conversations')
              .insert({
                user_id: user.id,
                agent_type: 'budget_assistant',
                conversation_history: newHistory,
                message_count: newHistory.length,
                title: message.slice(0, 50)
              });
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in budget-orchestrator:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'RATE_LIMIT_EXCEEDED') {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorMessage === 'PAYMENT_REQUIRED') {
      return new Response(
        JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
