
/**
 * OpenAI client for recipe generation
 */

export async function generateRecipeFromOpenAI(
  prompt: string, 
  openaiApiKey: string,
  differentIdea: boolean
): Promise<string> {
  console.log("Calling OpenAI with prompt:", prompt.substring(0, 100) + "...");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
      "OpenAI-Beta": "assistants=v1"  // Enable assistants API
    },
    body: JSON.stringify({
      model: "gpt-4o", // Using GPT-4o for better recipe generation
      messages: [
        {
          role: "system",
          content: "You are FiMe Recipe Expert, a professional nutritionist who specializes in creating healthy recipes with accurate nutritional information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI API error:", JSON.stringify(errorData));
    throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.choices[0].message?.content || "";
}
