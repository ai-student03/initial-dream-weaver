
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildPrompt } from "./prompt-builder.ts";
import { generateRecipeFromOpenAI } from "./openai-client.ts";
import { parseRecipeFromAIResponse } from "./recipe-parser.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, goals, cookingTime, differentIdea = false } = await req.json();

    // Validate input
    if (!ingredients || !goals || !cookingTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt for OpenAI
    const prompt = buildPrompt(ingredients, goals, cookingTime, differentIdea);

    try {
      // Get AI response using the Assistants API
      const aiResponse = await generateRecipeFromOpenAI(prompt, openaiApiKey, differentIdea);
      
      // Parse recipe from AI response
      const recipe = parseRecipeFromAIResponse(aiResponse, cookingTime, goals);

      return new Response(JSON.stringify(recipe), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error during recipe generation:", error);
      return new Response(
        JSON.stringify({ error: `Recipe generation error: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: `Failed to generate recipe: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
