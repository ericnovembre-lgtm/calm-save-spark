import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    download_location: string;
  };
  alt_description: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
    if (!accessKey) {
      throw new Error('UNSPLASH_ACCESS_KEY not configured');
    }

    const { query, orientation = 'landscape', count = 10, action = 'search' } = await req.json();

    if (!query) {
      throw new Error('Query parameter is required');
    }

    let url: string;
    
    if (action === 'random') {
      // Get a single random photo
      url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=${orientation}`;
    } else {
      // Search for photos
      url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=${count}`;
    }

    console.log(`Fetching from Unsplash: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unsplash API error:', errorText);
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    // Format response based on action type
    if (action === 'random') {
      const photo = data as UnsplashImage;
      return new Response(JSON.stringify({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        full: photo.urls.full,
        photographer: photo.user.name,
        photographer_username: photo.user.username,
        photographer_url: photo.user.links.html,
        download_location: photo.links.download_location,
        alt: photo.alt_description,
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } else {
      // Search results
      const photos = data.results.map((photo: UnsplashImage) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        full: photo.urls.full,
        photographer: photo.user.name,
        photographer_username: photo.user.username,
        photographer_url: photo.user.links.html,
        download_location: photo.links.download_location,
        alt: photo.alt_description,
      }));

      return new Response(JSON.stringify({
        total: data.total,
        total_pages: data.total_pages,
        results: photos,
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetch-unsplash-image:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
