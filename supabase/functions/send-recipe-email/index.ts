
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
    
    // Initialize the Resend client with the API key
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    // Check for Resend API key
    if (!Deno.env.get('RESEND_API_KEY')) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    // Generate HTML for the email
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
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Base styles */
        body { 
          font-family: 'Poppins', 'Helvetica', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333333; 
          margin: 0; 
          padding: 0;
          background-color: #ffffff;
        }
        
        /* Container */
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        
        /* Header */
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #F2FCE2;
          margin-bottom: 30px;
        }
        
        /* Recipe title */
        .recipe-title {
          color: #A8D5BA;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }
        
        /* Nutrition box */
        .nutrition-box {
          background-color: #F2FCE2;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          text-align: center;
        }
        
        .nutrition-item {
          flex: 1;
          padding: 8px;
        }
        
        .nutrition-value {
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          display: block;
        }
        
        .nutrition-label {
          font-size: 12px;
          color: #6B7280;
          display: block;
        }
        
        /* Cooking time badge */
        .cooking-time {
          background-color: #A8D5BA;
          color: #ffffff;
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        /* Section title */
        .section-title {
          color: #333333;
          font-size: 18px;
          font-weight: 600;
          margin-top: 25px;
          margin-bottom: 10px;
          border-bottom: 1px solid #F1F0FB;
          padding-bottom: 8px;
        }
        
        /* Ingredients */
        .ingredients {
          padding-left: 20px;
          margin-bottom: 25px;
        }
        
        .ingredients li {
          margin-bottom: 6px;
        }
        
        /* Instructions */
        .instructions {
          counter-reset: steps;
          padding-left: 0;
          list-style-type: none;
        }
        
        .instructions li {
          margin-bottom: 12px;
          padding-left: 35px;
          position: relative;
        }
        
        .instructions li::before {
          counter-increment: steps;
          content: counter(steps);
          position: absolute;
          left: 0;
          top: 2px;
          background-color: #A8D5BA;
          color: #ffffff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          text-align: center;
          line-height: 24px;
          font-weight: bold;
          font-size: 14px;
        }
        
        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #F1F0FB;
          text-align: center;
          color: #888888;
          font-size: 12px;
        }
        
        /* Goals */
        .goals-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
          margin-bottom: 20px;
        }
        
        .goal-tag {
          background-color: #F1F0FB;
          color: #555555;
          padding: 4px 10px;
          border-radius: 15px;
          font-size: 12px;
          display: inline-block;
        }
        
        /* Image */
        .dish-image {
          width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://eplrkuifwkwpzfv.lovable.cdn.app/images/fime-logo.png" alt="FiMe Logo" style="max-height: 60px; margin-bottom: 15px;">
        </div>
        
        <h1 class="recipe-title">${recipe.recipeName}</h1>
        
        <div class="nutrition-box">
          <div class="nutrition-item">
            <span class="nutrition-value">${recipe.calories}</span>
            <span class="nutrition-label">calories</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${recipe.protein}g</span>
            <span class="nutrition-label">protein</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${recipe.carbs}g</span>
            <span class="nutrition-label">carbs</span>
          </div>
          <div class="nutrition-item">
            <span class="nutrition-value">${recipe.fat}g</span>
            <span class="nutrition-label">fat</span>
          </div>
        </div>
        
        <div>
          <span class="cooking-time">Cooking time: ${recipe.cookingTime} minutes</span>
          
          <div class="goals-container">
            ${recipe.goals.map(goal => `<span class="goal-tag">${goal}</span>`).join('')}
          </div>
        </div>
        
        <h2 class="section-title">Ingredients</h2>
        <ul class="ingredients">
          ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        
        <h2 class="section-title">Instructions</h2>
        <ol class="instructions">
          ${formatInstructions(recipe.instructions)}
        </ol>
        
        <div class="footer">
          <p>Generated by FiMe – Your Smart Nutrition Assistant</p>
          <p>Enjoy your delicious and healthy meal!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to format instructions as list items
function formatInstructions(instructions) {
  if (!instructions) return '';
  
  // If instructions are already numbered (1., 2., etc.)
  if (/^\d+\.\s/m.test(instructions)) {
    return instructions
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(step => {
        // Extract just the instruction text without the numbering
        const cleanStep = step.replace(/^\d+\.\s*/, '').trim();
        return cleanStep ? `<li>${cleanStep}</li>` : '';
      })
      .join('');
  }
  
  // If not numbered, format as a list
  return instructions
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(step => `<li>${step.trim()}</li>`)
    .join('');
}
