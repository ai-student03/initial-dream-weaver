
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
    const { recipe, email } = await req.json();

    if (!recipe || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, we'll simulate sending an email
    // In a production environment, you would use a service like SendGrid, Resend, etc.
    console.log(`Sending recipe "${recipe.recipeName}" to ${email}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

    /* 
    // Example implementation with an email service like Resend
    // You would need to add the RESEND_API_KEY to your Supabase secrets
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const { data, error } = await resend.emails.send({
      from: 'FiMe <recipes@yourdomain.com>',
      to: [email],
      subject: `Your Recipe: ${recipe.recipeName}`,
      html: generateEmailHtml(recipe),
    });

    if (error) {
      throw new Error(`Email service error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    */
  } catch (error) {
    console.error('Error in send-recipe-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/*
function generateEmailHtml(recipe) {
  // Generate HTML email template with the recipe details
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background-color: #f8a5c2; padding: 20px; text-align: center; color: white; }
        .content { padding: 20px; }
        .nutrition { display: flex; background-color: #f3f4f6; padding: 10px; margin-bottom: 20px; }
        .nutrition div { flex: 1; text-align: center; }
        h1 { color: #333; }
        h2 { color: #555; }
        ul { padding-left: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FiMe Recipe</h1>
        </div>
        <div class="content">
          <h2>${recipe.recipeName}</h2>
          
          <div class="nutrition">
            <div>
              <p><strong>${recipe.calories}</strong></p>
              <p>calories</p>
            </div>
            <div>
              <p><strong>${recipe.protein}g</strong></p>
              <p>protein</p>
            </div>
            <div>
              <p><strong>${recipe.carbs}g</strong></p>
              <p>carbs</p>
            </div>
            <div>
              <p><strong>${recipe.fat}g</strong></p>
              <p>fat</p>
            </div>
          </div>
          
          <h3>Ingredients</h3>
          <ul>
            ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
          </ul>
          
          <h3>Instructions</h3>
          <p>${recipe.instructions.replace(/\n/g, '<br>')}</p>
          
          <div class="footer">
            <p>Sent from FiMe - Your Smart Nutrition Assistant</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
*/
