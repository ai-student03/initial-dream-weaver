
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { NutritionGoal, RecipeFormData } from '@/lib/types';

// Sample nutrition goals
const NUTRITION_GOALS: NutritionGoal[] = [
  'Build muscle',
  'Lose fat',
  'Maintain weight',
  'Cycle-based nutrition',
  'Vegan',
  'Gluten-free',
  'Kosher'
];

const Nutrition: React.FC = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>({
    ingredients: '',
    goals: [],
    cookingTime: 30,
  });

  const toggleGoal = (goal: NutritionGoal) => {
    if (formData.goals.includes(goal)) {
      setFormData({
        ...formData,
        goals: formData.goals.filter(g => g !== goal)
      });
    } else {
      setFormData({
        ...formData,
        goals: [...formData.goals, goal]
      });
    }
  };

  const handleStartVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Voice input isn't supported in your browser");
      return;
    }

    // @ts-ignore - SpeechRecognition is not in the TS lib
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening for ingredients...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData({
        ...formData,
        ingredients: formData.ingredients ? `${formData.ingredients}, ${transcript}` : transcript
      });
    };

    recognition.onerror = () => {
      toast.error("Error occurred in voice recognition");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleGenerate = async () => {
    if (!formData.ingredients) {
      toast.error("Please enter some ingredients");
      return;
    }

    if (formData.goals.length === 0) {
      toast.error("Please select at least one goal");
      return;
    }

    setIsGenerating(true);

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to generate recipes");
        navigate("/auth");
        setIsGenerating(false);
        return;
      }

      // Generate recipe with OpenAI (would be implemented in a Supabase Edge Function)
      navigate("/recipe/preview", { state: { formData } });
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast.error("Failed to generate recipe. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-xl px-4 py-8">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">FiMe</h1>
          <p className="text-muted-foreground">Your Smart Nutrition Assistant</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">What ingredients do you have right now?</h2>
          <div className="space-y-4">
            <Textarea
              placeholder="E.g., chicken breast, spinach, olive oil, brown rice..."
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="h-24"
            />
            <Button 
              onClick={handleStartVoiceInput} 
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              disabled={isListening}
            >
              {isListening ? 'Listening...' : 'Speak your ingredients'}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">What are your goals for this meal?</h2>
          <div className="flex flex-wrap gap-2">
            {NUTRITION_GOALS.map((goal) => (
              <Button
                key={goal}
                onClick={() => toggleGoal(goal)}
                variant={formData.goals.includes(goal) ? "default" : "outline"}
                className="flex-grow-0"
              >
                {goal}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">How much time do you have to cook?</h2>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="5"
              max="180"
              value={formData.cookingTime}
              onChange={(e) => setFormData({ ...formData, cookingTime: parseInt(e.target.value) || 30 })}
              className="w-full"
            />
            <span className="text-muted-foreground whitespace-nowrap">minutes</span>
          </div>
        </Card>

        <Button
          onClick={handleGenerate}
          className="w-full py-6 text-lg"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Recipe'}
        </Button>
      </div>
    </div>
  );
};

export default Nutrition;
