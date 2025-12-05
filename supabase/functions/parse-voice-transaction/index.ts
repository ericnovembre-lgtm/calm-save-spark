import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedTransaction {
  amount: number;
  merchant: string;
  category?: string;
  transaction_date: string;
  confidence: number;
}

const categoryKeywords: Record<string, string[]> = {
  'Food & Dining': ['restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'food', 'eat', 'starbucks', 'mcdonald', 'chipotle', 'pizza'],
  'Transportation': ['uber', 'lyft', 'gas', 'fuel', 'parking', 'transit', 'metro', 'bus', 'taxi', 'car'],
  'Shopping': ['amazon', 'target', 'walmart', 'store', 'mall', 'shop', 'buy', 'purchase', 'clothes'],
  'Entertainment': ['movie', 'netflix', 'spotify', 'concert', 'game', 'theater', 'show'],
  'Groceries': ['grocery', 'supermarket', 'whole foods', 'trader joe', 'costco', 'safeway', 'kroger'],
  'Bills & Utilities': ['electric', 'water', 'internet', 'phone', 'bill', 'utility', 'rent'],
  'Health': ['pharmacy', 'doctor', 'hospital', 'medicine', 'cvs', 'walgreens', 'gym', 'fitness']
};

function detectCategory(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return category;
    }
  }
  
  return undefined;
}

function parseAmount(text: string): { amount: number; confidence: number } {
  // Pattern: $XX, $XX.XX, XX dollars, XX bucks
  const patterns = [
    /\$(\d+(?:\.\d{2})?)/,
    /(\d+(?:\.\d{2})?)\s*(?:dollars?|bucks?)/i,
    /spent\s+(\d+(?:\.\d{2})?)/i,
    /paid\s+(\d+(?:\.\d{2})?)/i,
    /(\d+(?:\.\d{2})?)\s+(?:at|on|for)/i
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const match = text.match(patterns[i]);
    if (match) {
      return {
        amount: parseFloat(match[1]),
        confidence: 1 - (i * 0.1) // Higher confidence for earlier patterns
      };
    }
  }
  
  // Try to find any number
  const numberMatch = text.match(/(\d+(?:\.\d{2})?)/);
  if (numberMatch) {
    return {
      amount: parseFloat(numberMatch[1]),
      confidence: 0.5
    };
  }
  
  return { amount: 0, confidence: 0 };
}

function parseMerchant(text: string): { merchant: string; confidence: number } {
  const lowerText = text.toLowerCase();
  
  // Common patterns
  const patterns = [
    /(?:at|from|to)\s+([a-zA-Z\s']+?)(?:\s+(?:for|on|today|yesterday)|\.|$)/i,
    /(?:spent|paid|bought)\s+.*?(?:at|from)\s+([a-zA-Z\s']+)/i,
    /([a-zA-Z\s']+)\s+(?:purchase|transaction|payment)/i
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const match = text.match(patterns[i]);
    if (match && match[1]) {
      const merchant = match[1].trim();
      if (merchant.length > 1 && merchant.length < 50) {
        return {
          merchant: merchant.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
          confidence: 0.9 - (i * 0.1)
        };
      }
    }
  }
  
  // Known merchants
  const knownMerchants = [
    'Starbucks', 'Amazon', 'Target', 'Walmart', 'Uber', 'Lyft', 
    'Netflix', 'Spotify', 'Apple', 'Google', 'Microsoft',
    'McDonalds', 'Chipotle', 'Whole Foods', 'Costco', 'CVS'
  ];
  
  for (const merchant of knownMerchants) {
    if (lowerText.includes(merchant.toLowerCase())) {
      return { merchant, confidence: 0.95 };
    }
  }
  
  return { merchant: 'Unknown', confidence: 0.3 };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing voice input:', text);

    const { amount, confidence: amountConfidence } = parseAmount(text);
    const { merchant, confidence: merchantConfidence } = parseMerchant(text);
    const category = detectCategory(text);

    if (amount === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not detect amount from text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: ParsedTransaction = {
      amount,
      merchant,
      category,
      transaction_date: new Date().toISOString(),
      confidence: (amountConfidence + merchantConfidence) / 2
    };

    console.log('Parsed result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-voice-transaction:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
