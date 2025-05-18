
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

    // Try to get keywords from the prompt for a better fallback image
    const keywords = prompt
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 5)
      .join(',');
    
    // Create a specific food-related fallback URL with timestamp to prevent caching
    const fallbackUrl = `https://source.unsplash.com/featured/?food,cooking,${encodeURIComponent(keywords)}&${Date.now()}`;
    
    // Here we would normally call an image generation API like OpenAI DALL-E,
    // Stability AI, or similar. Since we don't have those set up, we'll use the fallback.
    console.log('Using fallback image URL:', fallbackUrl);
    
    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: fallbackUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-recipe-image function:', error);
    
    // Provide a fallback image using Unsplash for food
    const fallbackUrl = `https://source.unsplash.com/featured/?food,dish,cooking,recipe&${Date.now()}`;
    console.log('Using fallback image URL after error:', fallbackUrl);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        imageUrl: fallbackUrl // Still return an image even on error
      }),
      { 
        status: 200, // Return 200 even for errors since we're providing a fallback
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
