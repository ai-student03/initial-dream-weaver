
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
const FAL_API_URL = "https://api.fal.ai/v1/image/generate";

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

    // Log the API key (just the first few characters for security)
    const apiKeyPreview = FAL_API_KEY ? `${FAL_API_KEY.slice(0, 3)}...${FAL_API_KEY.slice(-3)}` : 'undefined';
    console.log(`FAL API Key status: ${FAL_API_KEY ? 'present' : 'missing'} (preview: ${apiKeyPreview})`);
    
    if (!FAL_API_KEY) {
      console.error('FAL_API_KEY is not set in environment variables');
      throw new Error('Missing FAL_API_KEY environment variable');
    }

    // Construct a rich prompt for food image generation
    const enhancedPrompt = `A professional, appetizing photo of ${recipeName}: ${prompt}. Food photography style, top-down view, natural lighting, high resolution, restaurant-quality presentation, on a beautiful plate or dish, garnished appropriately.`;
    
    console.log(`Generating image for recipe: ${recipeName}`);
    console.log(`Using prompt: ${enhancedPrompt}`);

    // Call the FAL.ai API for image generation
    console.log(`Sending request to ${FAL_API_URL}...`);
    
    try {
      const response = await fetch(FAL_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          model: "realistic-vision-v5-1", // Using a high-quality food-compatible model
          height: 768,
          width: 768,
          guidance_scale: 7.5,
          num_inference_steps: 30,
          seed: 42, // Fixed seed for consistency
        })
      });

      // Log the response status
      console.log(`FAL API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('FAL API error:', errorText);
        throw new Error(`FAL API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('FAL API response data:', JSON.stringify(data, null, 2));
      
      const generatedImageUrl = data.images?.[0]?.url;

      if (!generatedImageUrl) {
        throw new Error('No image URL was returned from FAL API');
      }

      console.log('Successfully generated image:', generatedImageUrl);
      
      return new Response(
        JSON.stringify({
          success: true,
          imageUrl: generatedImageUrl
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (apiError) {
      console.error('Error calling FAL API:', apiError);
      throw apiError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error('Error in generate-recipe-image function:', error);
    
    // Provide a fallback image using Unsplash for food
    const fallbackUrl = `https://source.unsplash.com/featured/?food,dish,cooking,recipe&${Date.now()}`;
    console.log('Using fallback image URL:', fallbackUrl);
    
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
