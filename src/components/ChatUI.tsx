
import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { NutritionGoal, Recipe } from "@/lib/types";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Message = {
  role: 'assistant' | 'user';
  content: string;
};

type ChatState = {
  step: 'welcome' | 'ingredients' | 'goals' | 'cookingTime' | 'generating' | 'complete';
  messages: Message[];
  ingredientsInput: string;
  selectedGoals: NutritionGoal[];
  cookingTime: number;
};

const NUTRITION_GOALS: NutritionGoal[] = [
  'Build muscle',
  'Lose fat',
  'Maintain weight',
  'Cycle-based nutrition',
  'Vegan',
  'Gluten-free',
  'Kosher'
];

export const ChatUI: React.FC = () => {
  const navigate = useNavigate();
  const [chatState, setChatState] = useState<ChatState>({
    step: 'welcome',
    messages: [{
      role: 'assistant',
      content: "👋 Hi there! I'm FiMe, your friendly nutrition assistant. What ingredients do you currently have at home?"
    }],
    ingredientsInput: '',
    selectedGoals: [],
    cookingTime: 30
  });
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const form = useForm();

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  const handleUserInput = () => {
    if (!userInput.trim()) return;

    const updatedMessages = [...chatState.messages, { role: 'user', content: userInput }];
    
    // Add user's message and process based on current step
    if (chatState.step === 'ingredients') {
      // Save ingredients and ask for goals
      setChatState({
        ...chatState,
        step: 'goals',
        messages: [
          ...updatedMessages,
          {
            role: 'assistant',
            content: "Great! Now, what's your goal for this meal? You can select multiple options."
          }
        ],
        ingredientsInput: userInput,
      });
    } else {
      // Just add the user message for other cases
      setChatState({
        ...chatState,
        messages: updatedMessages,
      });
    }
    
    setUserInput('');
  };

  const handleSelectGoals = (goals: NutritionGoal[]) => {
    setChatState({
      ...chatState,
      step: 'cookingTime',
      messages: [
        ...chatState.messages,
        {
          role: 'assistant',
          content: `Thanks! You've selected: ${goals.join(', ')}. How many minutes do you have to cook?`
        }
      ],
      selectedGoals: goals
    });
  };

  const handleSetCookingTime = (time: number) => {
    setChatState({
      ...chatState,
      step: 'generating',
      messages: [
        ...chatState.messages,
        { role: 'user', content: `${time} minutes` },
        { role: 'assistant', content: "Perfect! I'm creating a delicious recipe for you now..." }
      ],
      cookingTime: time
    });

    // Navigate to recipe preview with form data
    navigate("/recipe/preview", { 
      state: { 
        formData: {
          ingredients: chatState.ingredientsInput,
          goals: chatState.selectedGoals,
          cookingTime: time
        } 
      } 
    });
  };

  // Render appropriate input based on current step
  const renderInputBasedOnStep = () => {
    switch (chatState.step) {
      case 'welcome':
        return (
          <div className="flex space-x-2">
            <Input
              placeholder="E.g., chicken, rice, broccoli..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStepForward()}
              className="flex-grow"
            />
            <Button onClick={handleStepForward}>Continue</Button>
          </div>
        );
      
      case 'ingredients':
        return (
          <div className="flex space-x-2">
            <Input
              placeholder="E.g., chicken, rice, broccoli..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
              className="flex-grow"
            />
            <Button onClick={handleUserInput}>Send</Button>
          </div>
        );
      
      case 'goals':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {NUTRITION_GOALS.map((goal) => (
                <Button
                  key={goal}
                  onClick={() => {
                    const newGoals = chatState.selectedGoals.includes(goal) 
                      ? chatState.selectedGoals.filter(g => g !== goal)
                      : [...chatState.selectedGoals, goal];
                    setChatState({ ...chatState, selectedGoals: newGoals });
                  }}
                  variant={chatState.selectedGoals.includes(goal) ? "default" : "outline"}
                  className="flex-grow-0"
                >
                  {goal}
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => handleSelectGoals(chatState.selectedGoals)}
              disabled={chatState.selectedGoals.length === 0}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        );
      
      case 'cookingTime':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="5"
                max="180"
                value={chatState.cookingTime}
                onChange={(e) => setChatState({ 
                  ...chatState, 
                  cookingTime: parseInt(e.target.value) || 30 
                })}
              />
              <span>minutes</span>
            </div>
            <Button 
              onClick={() => handleSetCookingTime(chatState.cookingTime)}
              className="w-full"
            >
              Generate Recipe
            </Button>
          </div>
        );
      
      case 'generating':
        return (
          <div className="text-center py-4">
            <div className="animate-pulse">Generating your perfect recipe...</div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleStepForward = () => {
    if (chatState.step === 'welcome') {
      setChatState({
        ...chatState,
        step: 'ingredients',
        messages: [...chatState.messages]
      });
      setUserInput('');
    } else {
      handleUserInput();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatState.messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            <div 
              className={`flex max-w-[80%] ${
                message.role === 'assistant' ? 'items-start' : 'items-end flex-row-reverse'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 mr-2 bg-primary text-primary-foreground">
                  <span>FiMe</span>
                </Avatar>
              )}
              <div 
                className={`rounded-lg px-4 py-2 ${
                  message.role === 'assistant' 
                    ? 'bg-muted text-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4 bg-background">
        {renderInputBasedOnStep()}
      </div>
    </div>
  );
};
