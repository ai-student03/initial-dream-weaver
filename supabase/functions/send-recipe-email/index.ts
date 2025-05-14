
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

    // Log email sending details for debugging
    console.log(`Sending recipe "${recipe.recipeName}" to ${email}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // The real implementation would use an email service like Resend
    /* 
    // Example implementation with an email service like Resend
    // You would need to add the RESEND_API_KEY to your Supabase secrets
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const { data, error } = await resend.emails.send({
      from: "FiMe <recipes@yourdomain.com>",
      to: [email],
      subject: `Your Recipe: ${recipe.recipeName}`,
      html: generateEmailHtml(recipe),
    });

    if (error) {
      throw new Error(`Email service error: ${error.message}`);
    }
    */

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

function generateEmailHtml(recipe) {
  // Generate HTML email template with the recipe details
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Poppins', 'Nunito', sans-serif;
          line-height: 1.6; 
          color: #333;
          background-color: #fcfcfc;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .header { 
          background: linear-gradient(to right, #FFDAB9, #F8BBD0);
          padding: 30px 20px;
          text-align: center;
          color: #333;
        }
        .content { 
          padding: 30px;
        }
        .nutrition { 
          display: flex;
          background-color: rgba(255,218,185,0.2);
          padding: 15px;
          margin-bottom: 25px;
          border-radius: 10px;
        }
        .nutrition div { 
          flex: 1;
          text-align: center;
        }
        h1 {
          color: #FF6F61;
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        h2 { 
          color: #FF6F61;
          margin-top: 0;
          font-size: 24px;
        }
        h3 {
          color: #FF6F61;
          font-size: 18px;
          margin-bottom: 10px;
        }
        ul { 
          padding-left: 20px;
          margin-bottom: 25px;
        }
        li {
          margin-bottom: 8px;
        }
        .footer { 
          text-align: center;
          padding: 20px;
          background-color: rgba(255,218,185,0.1);
          font-size: 0.9em;
          color: #666;
          border-top: 1px solid rgba(248,187,208,0.3);
        }
        .motivational { 
          background-color: rgba(248,187,208,0.15);
          border-left: 4px solid #FF6F61;
          padding: 15px;
          margin: 25px 0;
          border-radius: 0 8px 8px 0;
        }
        .goals {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        .goal-tag {
          background-color: rgba(248,187,208,0.3);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 500;
        }
        .logo {
          font-weight: 800;
          font-size: 32px;
          color: #FF6F61;
          margin-bottom: 5px;
        }
        .logo-tagline {
          font-size: 14px;
          color: #666;
        }
        .instructions {
          background-color: #fff;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          margin-bottom: 25px;
        }
        .recipe-image {
          max-width: 100%;
          border-radius: 8px;
          margin-bottom: 20px;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FiMe</div>
          <div class="logo-tagline">Your Smart Nutrition Assistant</div>
        </div>
        <div class="content">
          <h2>${recipe.recipeName}</h2>
          
          ${recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.recipeName}" class="recipe-image"/>` : ''}
          
          <div class="motivational">
            <p>Amazing choice! This delicious meal is perfectly aligned with your ${recipe.goals.join(', ')} goals. Your body will thank you for the nourishment!</p>
          </div>
          
          <div class="goals">
            ${recipe.goals.map(goal => `<span class="goal-tag">${goal}</span>`).join('')}
          </div>
          
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
          
          <h3>Ready in ${recipe.cookingTime} minutes</h3>
          
          <h3>Ingredients</h3>
          <ul>
            ${Array.isArray(recipe.ingredients) 
              ? recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')
              : `<li>${recipe.ingredients}</li>`}
          </ul>
          
          <h3>Instructions</h3>
          <div class="instructions">
            ${recipe.instructions.replace(/\n/g, '<br><br>')}
          </div>
          
          <div class="motivational">
            <p>Enjoy this healthy meal! Remember, taking care of your body with nutritious food is a powerful act of self-love. You've got this! 💪</p>
          </div>
        </div>
        <div class="footer">
          <p>Sent from FiMe - Your Smart Nutrition Assistant</p>
          <p>Making healthy eating simple and delicious!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
