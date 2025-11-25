import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type GeniusMode = 'purchase' | 'travel' | 'dispute' | 'benefits';

interface GeniusRequest {
  mode: GeniusMode;
  query: string;
  context?: {
    cardId?: string;
    amount?: number;
    merchant?: string;
    destination?: string;
  };
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, query, context }: GeniusRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Mode-specific system prompts
    const systemPrompts: Record<GeniusMode, string> = {
      purchase: `You are a credit card rewards expert. Analyze purchases and provide:
1. Exact points/cashback earned
2. Applicable card protections (purchase protection, extended warranty, price protection)
3. Any special bonus categories
Format response with clear numbers and protection details. Return structured data.`,
      
      travel: `You are a travel credit card concierge. For the given destination, provide:
1. Local tipping culture and percentages (e.g., "10-15% standard")
2. Currency information
3. Foreign transaction fee warnings
4. Travel protections available (trip delay, baggage, rental car)
Return as JSON with: { tips: string, currency: string, fxFee: string, protections: string[] }`,
      
      dispute: `You are a banking dispute specialist. Draft a formal, professional dispute letter that:
1. States the issue clearly
2. References consumer protection laws
3. Requests specific action
4. Maintains professional tone
Return as JSON with: { letter: string, subject: string, keyPoints: string[] }`,
      
      benefits: `You are a credit card benefits expert. Check if the user's situation is covered by:
1. Cell phone protection
2. Purchase protection
3. Extended warranty
4. Return protection
Return as JSON with: { covered: boolean, coverageAmount: number, benefit: string, claimProcess: string }`
    };

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompts[mode] },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const result = aiData.choices[0].message.content;

    // Parse structured data for all modes
    let structured = undefined;
    try {
      if (mode === 'purchase') {
        // Extract points and protections
        const pointsMatch = result.match(/(\d+)\s*points/i);
        const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;
        
        const protections: string[] = [];
        if (result.toLowerCase().includes('purchase protection')) protections.push('Purchase Protection');
        if (result.toLowerCase().includes('extended warranty')) protections.push('Extended Warranty');
        if (result.toLowerCase().includes('price protection')) protections.push('Price Protection');
        if (result.toLowerCase().includes('trip delay')) protections.push('Trip Delay Insurance');
        
        structured = { points, protections };
      } else if (mode === 'travel') {
        // Try to parse JSON response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structured = JSON.parse(jsonMatch[0]);
        }
      } else if (mode === 'dispute') {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structured = JSON.parse(jsonMatch[0]);
        }
      } else if (mode === 'benefits') {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structured = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.error('Failed to parse structured data:', e);
    }

    return new Response(
      JSON.stringify({
        mode,
        result,
        structured
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Card Genius error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
