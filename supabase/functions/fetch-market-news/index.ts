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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY');
    if (!NEWS_API_KEY) {
      throw new Error('NEWS_API_KEY not configured');
    }

    // Get unique symbols from user holdings
    const { data: holdings } = await supabaseClient
      .from('portfolio_holdings')
      .select('symbol')
      .not('symbol', 'is', null)
      .limit(10); // Top 10 holdings

    const symbols = [...new Set(holdings?.map(h => h.symbol) || [])];
    console.log(`Fetching news for ${symbols.length} symbols`);

    // Fetch market-wide news
    const marketNewsResponse = await fetch(
      `https://newsapi.org/v2/everything?q=(stock OR market OR finance)&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}&pageSize=20`
    );
    const marketNewsData = await marketNewsResponse.json();

    let newsInserted = 0;

    // Process market news
    if (marketNewsData.articles) {
      for (const article of marketNewsData.articles.slice(0, 10)) {
        try {
          // Determine sentiment (simple keyword-based)
          const text = `${article.title} ${article.description}`.toLowerCase();
          let sentiment = 'neutral';
          if (text.includes('surge') || text.includes('gain') || text.includes('up') || text.includes('bull')) {
            sentiment = 'positive';
          } else if (text.includes('drop') || text.includes('fall') || text.includes('down') || text.includes('bear')) {
            sentiment = 'negative';
          }

          await supabaseClient
            .from('market_news_cache')
            .insert({
              symbol: 'MARKET',
              headline: article.title,
              source: article.source?.name || 'Unknown',
              published_at: article.publishedAt,
              url: article.url,
              sentiment,
              relevance_score: 0.8,
            });

          newsInserted++;
        } catch (error) {
          console.error('Error inserting news:', error);
        }
      }
    }

    // Fetch symbol-specific news (if rate limits allow)
    for (const symbol of symbols.slice(0, 3)) { // Limit to avoid rate limits
      try {
        const symbolNewsResponse = await fetch(
          `https://newsapi.org/v2/everything?q=${symbol}&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}&pageSize=5`
        );
        const symbolNewsData = await symbolNewsResponse.json();

        if (symbolNewsData.articles) {
          for (const article of symbolNewsData.articles) {
            const text = `${article.title} ${article.description}`.toLowerCase();
            let sentiment = 'neutral';
            if (text.includes('surge') || text.includes('gain') || text.includes('up')) {
              sentiment = 'positive';
            } else if (text.includes('drop') || text.includes('fall') || text.includes('down')) {
              sentiment = 'negative';
            }

            await supabaseClient
              .from('market_news_cache')
              .insert({
                symbol,
                headline: article.title,
                source: article.source?.name || 'Unknown',
                published_at: article.publishedAt,
                url: article.url,
                sentiment,
                relevance_score: 0.9,
              });

            newsInserted++;
          }
        }
      } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
      }
    }

    // Clean up old news
    await supabaseClient.rpc('cleanup_expired_news_cache');

    return new Response(
      JSON.stringify({ 
        success: true,
        news_items_cached: newsInserted,
        message: 'Market news updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fetch Market News Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
