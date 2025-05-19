
/**
 * Builds prompts for recipe generation
 */

export function buildPrompt(
  ingredients: string,
  goals: string[],
  cookingTime: string | number,
  differentIdea: boolean = false
): string {
  let prompt = `Act as a professional nutritionist and recipe developer.

The user has the following:
Ingredients: ${ingredients}  
Goal: ${goals.join(", ")}  
Cooking time: ${cookingTime} minutes

Your task:
1. Suggest one realistic, healthy, and satisfying recipe that fits the goal and can be made in the available time.
2. Use only ingredients that logically go well together — you do not need to use all of them.
3. Be creative: e.g., you can use just the yolk or just the white of an egg.
4. Each ingredient should be considered individually.
5. If this is a follow-up request, generate a completely different dish.
6. Make sure the instructions are clear, numbered, and easy to follow.
7. Estimate nutritional values as accurately as possible based on the ingredients used.

❗ Important:
- **Always include a recipe name.**
- **Always include preparation steps.**
- **Always include nutritional values.**

---

🧾 Format your answer like this:

Recipe Name:  
[Insert name here]

Ingredients:  
- [ingredient 1]  
- [ingredient 2]  
...

Instructions:  
1. [Step one]  
2. [Step two]  
...

Nutritional Information (estimated):  
- Protein: ~Xg  
- Carbs: ~Xg  
- Fat: ~Xg  
- Calories: ~X`;

  // Add differentIdea flag instruction if this is a regeneration request
  if (differentIdea) {
    prompt += "\n\nPlease provide a completely different recipe than before. Change the dish style, structure, or cooking method.";
  }

  return prompt;
}
