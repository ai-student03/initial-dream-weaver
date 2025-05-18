
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, recipeName } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating image for recipe: ${recipeName || 'Recipe'}`);
    console.log(`Using prompt: ${prompt}`);
    
    // Extract keywords for better fallback image search
    const keywords = prompt
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 5)
      .join(',');
    
    // Create a timestamp to prevent caching
    const timestamp = Date.now();
    
    // For now, we'll use an Unsplash image as we don't have direct access to image generation APIs
    // In a production environment, you would replace this with actual API calls to DALL-E, Stable Diffusion, etc.
    const fallbackUrl = `https://source.unsplash.com/featured/?food,${encodeURIComponent(keywords)}&${timestamp}`;
    
    console.log('Using high-quality food image URL:', fallbackUrl);
    
    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: fallbackUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-recipe-image function:', error);
    
    // Generate food-related keywords for the fallback
    let keywords = 'food,cooking,recipe';
    try {
      // Try to extract keywords from the error or request
      const url = new URL(req.url);
      const params = new URLSearchParams(url.search);
      if (params.get('keywords')) {
        keywords += `,${params.get('keywords')}`;
      }
    } catch (e) {
      // Ignore errors in fallback keyword extraction
    }
    
    const timestamp = Date.now();
    const fallbackUrl = `https://source.unsplash.com/featured/?${encodeURIComponent(keywords)}&${timestamp}`;
    
    console.log('Using fallback image URL after error:', fallbackUrl);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        imageUrl: fallbackUrl 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
