
/**
 * OpenAI client for recipe generation
 */

export async function generateRecipeFromOpenAI(
  prompt: string, 
  openaiApiKey: string,
  differentIdea: boolean
): Promise<string> {
  console.log("Calling OpenAI with prompt:", prompt.substring(0, 100) + "...");

  // We have two options to generate recipes:
  // 1. Using direct chat completions API
  // 2. Using the Assistants API with a pre-configured assistant
  
  // We'll use the Chat Completions API as it's more reliable and doesn't require a pre-configured assistant
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Using a modern model that's efficient and capable
      messages: [
        {
          role: "system",
          content: "You are FiMe Recipe Expert, a professional nutritionist and chef who specializes in creating healthy, personalized recipes based on available ingredients, nutritional goals, and time constraints. You always provide accurate nutritional information and clear instructions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI API error:", JSON.stringify(errorData));
    throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log("Recipe generated successfully");
  return content;
}
