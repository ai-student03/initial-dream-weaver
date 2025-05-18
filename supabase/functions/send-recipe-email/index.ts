
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
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
    const { recipe, email } = await req.json();

    if (!recipe || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: recipe and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log email sending details for debugging
    console.log(`Sending recipe "${recipe.recipeName}" to ${email}`);
    console.log(`Recipe image URL: ${recipe.imageUrl}`);
    
    // Initialize the Resend client with the API key
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    // Check for Resend API key
    if (!Deno.env.get('RESEND_API_KEY')) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    // Generate HTML for the email with the AI-generated image
    const emailHtml = generateEmailHtml(recipe);
    
    // Send the email using Resend
    const { data, error: resendError } = await resend.emails.send({
      from: "FiMe <onboarding@resend.dev>",
      to: [email],
      subject: `Your Recipe: ${recipe.recipeName}`,
      html: emailHtml,
    });

    if (resendError) {
      throw new Error(`Resend API error: ${resendError.message}`);
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-recipe-email function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to generate HTML for the email
function generateEmailHtml(recipe) {
  // Add a timestamp to the image URL to prevent caching
  let imageUrl = recipe.imageUrl || 'https://source.unsplash.com/featured/?food,cooking';
  
  // Add a timestamp parameter to prevent caching
  if (imageUrl.includes('unsplash.com') && !imageUrl.includes('&t=')) {
    imageUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }
  
  console.log(`Using image URL in email HTML: ${imageUrl}`);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #FF6F61; }
        .header { text-align: center; margin-bottom: 30px; }
        .recipe-image { width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 20px; }
        .nutrition { display: flex; justify-content: space-between; background-color: #f9f9f9; padding: 15px; border-radius: 10px; margin-bottom: 20px; }
        .nutrition div { text-align: center; }
        .nutrition span { display: block; font-weight: bold; font-size: 18px; }
        .nutrition small { color: #777; }
        .section { margin-bottom: 25px; }
        .ingredients { padding-left: 20px; }
        .ingredients li { margin-bottom: 5px; }
        .instructions { white-space: pre-wrap; }
        .image-prompt { background-color: #f9f9f9; padding: 15px; border-radius: 10px; font-style: italic; margin-bottom: 20px; }
        .footer { text-align: center; font-size: 14px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        .fallback-text { text-align: center; color: #777; padding: 40px 20px; border: 1px dashed #ccc; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FiMe Recipe</h1>
        <h2>${recipe.recipeName}</h2>
      </div>
      
      <img src="${imageUrl}" alt="${recipe.recipeName}" class="recipe-image" onerror="this.onerror=null; this.src='https://source.unsplash.com/featured/?food,cooking'; this.parentNode.insertAdjacentHTML('afterend', '<p style=\'text-align:center; color:#777; font-size:12px;\'>The original image could not be displayed. A fallback image is shown.</p>');" />
      
      <div class="nutrition">
        <div>
          <span>${recipe.calories}</span>
          <small>calories</small>
        </div>
        <div>
          <span>${recipe.protein}g</span>
          <small>protein</small>
        </div>
        <div>
          <span>${recipe.carbs}g</span>
          <small>carbs</small>
        </div>
        <div>
          <span>${recipe.fat}g</span>
          <small>fat</small>
        </div>
      </div>
      
      <div class="section">
        <h3>Cooking Time</h3>
        <p>${recipe.cookingTime} minutes</p>
      </div>
      
      <div class="section">
        <h3>Ingredients</h3>
        <ul class="ingredients">
          ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h3>Instructions</h3>
        <div class="instructions">${recipe.instructions}</div>
      </div>
      
      <div class="section">
        <h3>AI-Generated Recipe Image</h3>
        <p>This recipe image was generated by AI based on your ingredients and cooking style.</p>
      </div>
      
      <div class="footer">
        <p>Generated by FiMe - Your Smart Nutrition Assistant</p>
      </div>
    </body>
    </html>
  `;
}
