import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { merchant } = await req.json();
    
    if (!merchant) {
      throw new Error('Merchant name is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if logo already cached
    const { data: cached } = await supabase
      .from('merchant_logos')
      .select('*')
      .eq('merchant_name', merchant)
      .maybeSingle();

    // Return cached if recent (< 30 days old)
    if (cached && cached.logo_url) {
      const cacheAge = Date.now() - new Date(cached.last_updated).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      if (cacheAge < thirtyDays) {
        return new Response(
          JSON.stringify(cached),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Extract domain from merchant name
    const domain = extractDomain(merchant);
    
    // Try Clearbit Logo API
    let logoUrl = null;
    try {
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      const response = await fetch(clearbitUrl);
      if (response.ok) {
        logoUrl = clearbitUrl;
      }
    } catch (error) {
      console.log('Clearbit fetch failed:', error);
    }

    // Generate fallback color based on merchant name
    const fallbackColor = generateColorFromString(merchant);

    // Upsert to cache
    const { data: enriched, error: upsertError } = await supabase
      .from('merchant_logos')
      .upsert({
        merchant_name: merchant,
        logo_url: logoUrl,
        domain: domain,
        fallback_color: fallbackColor,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'merchant_name',
      })
      .select()
      .single();

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify(enriched),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enriching logo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractDomain(merchant: string): string {
  // Remove common patterns
  const cleaned = merchant
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/^(www|app|api|pay|payment)/g, '');

  // Common merchant to domain mappings
  const knownDomains: { [key: string]: string } = {
    netflix: 'netflix.com',
    spotify: 'spotify.com',
    amazon: 'amazon.com',
    apple: 'apple.com',
    google: 'google.com',
    microsoft: 'microsoft.com',
    adobe: 'adobe.com',
    dropbox: 'dropbox.com',
    github: 'github.com',
    linkedin: 'linkedin.com',
    disney: 'disneyplus.com',
    hulu: 'hulu.com',
    hbo: 'hbo.com',
    paramount: 'paramount.com',
    peacock: 'peacock.com',
    zoom: 'zoom.us',
    slack: 'slack.com',
    notion: 'notion.so',
  };

  if (knownDomains[cleaned]) {
    return knownDomains[cleaned];
  }

  return `${cleaned}.com`;
}

function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}
