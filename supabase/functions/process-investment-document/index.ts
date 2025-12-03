import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GPT-5 for investment document analysis
const GPT5_MODEL = 'gpt-5-2025-08-07';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, documentUrl, fileName, documentType } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    let parsedData;
    let modelUsed = 'gpt-5';
    
    // Build specialized prompt based on document type
    const getSystemPrompt = (docType: string) => {
      const basePrompt = `You are an expert investment document analyst. Extract all relevant financial information accurately.

Be precise with all numeric values. If values are unclear, mark as "unclear" with lower confidence.`;

      const typePrompts: Record<string, string> = {
        '1099-div': `${basePrompt}

For 1099-DIV (Dividends and Distributions), extract:
- tax_year
- payer_name and payer_tin
- recipient_name and recipient_tin_last4
- total_ordinary_dividends (Box 1a)
- qualified_dividends (Box 1b)
- total_capital_gain_distributions (Box 2a)
- unrecaptured_section_1250_gain (Box 2b)
- section_1202_gain (Box 2c)
- collectibles_gain (Box 2d)
- nondividend_distributions (Box 3)
- federal_income_tax_withheld (Box 4)
- investment_expenses (Box 5)
- foreign_tax_paid (Box 7)
- cash_liquidation_distributions (Box 9)
- noncash_liquidation_distributions (Box 10)
- exempt_interest_dividends (Box 12)
- state_tax_withheld (Box 16)`,

        '1099-b': `${basePrompt}

For 1099-B (Proceeds from Broker and Barter Exchange Transactions), extract:
- tax_year
- broker_name and broker_tin
- recipient_name and recipient_tin_last4
- transactions (array of):
  - description (security name/CUSIP)
  - date_acquired
  - date_sold
  - proceeds
  - cost_basis
  - gain_or_loss
  - wash_sale_loss_disallowed
  - short_term_or_long_term
  - covered_or_noncovered
- total_proceeds
- total_cost_basis
- total_short_term_gain_loss
- total_long_term_gain_loss
- federal_income_tax_withheld`,

        'schedule-d': `${basePrompt}

For Schedule D (Capital Gains and Losses), extract:
- tax_year
- taxpayer_name and ssn_last4
- short_term_totals:
  - total_proceeds
  - total_cost_basis
  - total_gain_or_loss
  - short_term_gain_from_1099b
  - short_term_loss_carryover
- long_term_totals:
  - total_proceeds
  - total_cost_basis
  - total_gain_or_loss
  - long_term_gain_from_1099b
  - long_term_loss_carryover
  - gain_from_form_4797
  - section_1250_gain
- net_short_term_gain_loss
- net_long_term_gain_loss
- capital_loss_carryover_to_next_year`,

        'brokerage-statement': `${basePrompt}

For Brokerage/Investment Statements, extract:
- statement_period (start_date, end_date)
- account_number_last4
- account_holder_name
- broker_name
- account_value:
  - beginning_balance
  - ending_balance
  - change_amount
  - change_percentage
- holdings (array of):
  - symbol
  - description
  - quantity
  - price
  - market_value
  - cost_basis
  - unrealized_gain_loss
  - unrealized_gain_loss_percent
- asset_allocation:
  - stocks_percentage
  - bonds_percentage
  - cash_percentage
  - other_percentage
- activity_summary:
  - deposits
  - withdrawals
  - dividends_received
  - interest_received
  - fees_charged
- dividends_detail (array if available)
- realized_gains_losses`
      };

      return typePrompts[docType] || basePrompt;
    };

    // Determine document type from filename or provided type
    const detectDocumentType = (name: string, type?: string): string => {
      if (type) return type;
      const lower = name.toLowerCase();
      if (lower.includes('1099-div') || lower.includes('1099div')) return '1099-div';
      if (lower.includes('1099-b') || lower.includes('1099b')) return '1099-b';
      if (lower.includes('schedule-d') || lower.includes('scheduled') || lower.includes('schedule d')) return 'schedule-d';
      if (lower.includes('brokerage') || lower.includes('statement') || lower.includes('portfolio')) return 'brokerage-statement';
      return 'brokerage-statement'; // Default
    };

    const detectedType = detectDocumentType(fileName || '', documentType);
    
    if (openaiApiKey) {
      console.log('[Investment Document] Using GPT-5 for analysis, type:', detectedType);
      
      try {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GPT5_MODEL,
            messages: [{
              role: 'system',
              content: getSystemPrompt(detectedType)
            }, {
              role: 'user',
              content: `Analyze this investment document and extract all relevant information. Document URL: ${documentUrl}\nFile name: ${fileName}`
            }],
            max_completion_tokens: 6000,
            tools: [{
              type: 'function',
              function: {
                name: 'extract_investment_data',
                description: 'Extract structured investment document data',
                parameters: {
                  type: 'object',
                  properties: {
                    document_type: { 
                      type: 'string',
                      enum: ['1099-div', '1099-b', 'schedule-d', 'brokerage-statement', 'other']
                    },
                    tax_year: { type: 'integer' },
                    payer_name: { type: 'string' },
                    recipient_name: { type: 'string' },
                    // 1099-DIV fields
                    total_ordinary_dividends: { type: 'number' },
                    qualified_dividends: { type: 'number' },
                    total_capital_gain_distributions: { type: 'number' },
                    nondividend_distributions: { type: 'number' },
                    federal_income_tax_withheld: { type: 'number' },
                    foreign_tax_paid: { type: 'number' },
                    exempt_interest_dividends: { type: 'number' },
                    // 1099-B fields
                    transactions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          description: { type: 'string' },
                          date_acquired: { type: 'string' },
                          date_sold: { type: 'string' },
                          proceeds: { type: 'number' },
                          cost_basis: { type: 'number' },
                          gain_or_loss: { type: 'number' },
                          short_term_or_long_term: { type: 'string' }
                        }
                      }
                    },
                    total_proceeds: { type: 'number' },
                    total_cost_basis: { type: 'number' },
                    // Schedule D fields
                    net_short_term_gain_loss: { type: 'number' },
                    net_long_term_gain_loss: { type: 'number' },
                    capital_loss_carryover: { type: 'number' },
                    // Brokerage statement fields
                    statement_period: { 
                      type: 'object',
                      properties: {
                        start_date: { type: 'string' },
                        end_date: { type: 'string' }
                      }
                    },
                    account_value: {
                      type: 'object',
                      properties: {
                        beginning_balance: { type: 'number' },
                        ending_balance: { type: 'number' },
                        change_percentage: { type: 'number' }
                      }
                    },
                    holdings: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          symbol: { type: 'string' },
                          description: { type: 'string' },
                          quantity: { type: 'number' },
                          market_value: { type: 'number' },
                          cost_basis: { type: 'number' },
                          unrealized_gain_loss: { type: 'number' }
                        }
                      }
                    },
                    asset_allocation: {
                      type: 'object',
                      properties: {
                        stocks_percentage: { type: 'number' },
                        bonds_percentage: { type: 'number' },
                        cash_percentage: { type: 'number' }
                      }
                    },
                    // Summary
                    total_dividends: { type: 'number' },
                    total_realized_gains: { type: 'number' },
                    total_unrealized_gains: { type: 'number' },
                    confidence: { type: 'number' }
                  },
                  required: ['document_type', 'confidence']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'extract_investment_data' } }
          })
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error('[Investment Document] GPT-5 error:', aiResponse.status, errorText);
          throw new Error(`GPT-5 API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall && toolCall.function.arguments) {
          parsedData = JSON.parse(toolCall.function.arguments);
        } else {
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (gptError) {
        console.error('[Investment Document] GPT-5 failed, falling back to Gemini:', gptError);
        modelUsed = 'gemini-2.5-flash';
      }
    }

    // Fallback to Lovable AI (Gemini) if GPT-5 unavailable or failed
    if (!parsedData && lovableApiKey) {
      console.log('[Investment Document] Using Gemini 2.5 Flash fallback');
      modelUsed = 'gemini-2.5-flash';
      
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `Analyze this investment document (${detectedType}). Extract: document_type, tax_year, all income amounts, gains/losses, holdings if applicable. Return JSON. URL: ${documentUrl}`
          }],
          stream: false
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`Gemini API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;
      
      if (content) {
        // Strip markdown if present
        let cleanJson = content.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.slice(7);
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.slice(3);
        }
        if (cleanJson.endsWith('```')) {
          cleanJson = cleanJson.slice(0, -3);
        }
        cleanJson = cleanJson.trim();
        
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        }
      }
    }

    if (!parsedData) {
      throw new Error('Failed to extract data from investment document');
    }

    // Add metadata
    parsedData.model_used = modelUsed;
    parsedData.processed_at = new Date().toISOString();
    parsedData.detected_type = detectedType;

    // Calculate tax implications summary
    const taxSummary = {
      total_taxable_dividends: (parsedData.total_ordinary_dividends || 0) - (parsedData.qualified_dividends || 0),
      qualified_dividend_income: parsedData.qualified_dividends || 0,
      short_term_gains: parsedData.net_short_term_gain_loss || 0,
      long_term_gains: parsedData.net_long_term_gain_loss || 0,
      total_withholding: parsedData.federal_income_tax_withheld || 0,
      foreign_tax_credit: parsedData.foreign_tax_paid || 0,
    };
    
    parsedData.tax_summary = taxSummary;

    console.log('[Investment Document] Processing complete:', { 
      documentId, 
      modelUsed, 
      detectedType,
      hasTaxSummary: !!taxSummary 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      parsedData, 
      modelUsed,
      documentType: detectedType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Investment document processing error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
