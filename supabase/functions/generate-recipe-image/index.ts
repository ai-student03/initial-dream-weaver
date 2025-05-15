
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

    // Construct a rich prompt for food image generation
    const enhancedPrompt = `A professional, appetizing photo of ${recipeName}: ${prompt}. Food photography style, top-down view, natural lighting, high resolution, restaurant-quality presentation, on a beautiful plate or dish, garnished appropriately.`;
    
    console.log(`Generating image for recipe: ${recipeName}`);
    console.log(`Using prompt: ${enhancedPrompt}`);

    // Call the FAL.ai API for image generation
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAL API error:', errorText);
      throw new Error(`FAL API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedImageUrl = data.images?.[0]?.url;

    if (!generatedImageUrl) {
      throw new Error('No image URL was returned from FAL API');
    }
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
 catch (error) {
    console.error('Error in generate-recipe-image function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
