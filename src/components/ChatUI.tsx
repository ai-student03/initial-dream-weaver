
import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NutritionGoal, Recipe } from "@/lib/types";
import { useNavigate } from 'react-router-dom';
import { Send, Mic, ArrowDown, Check, Loader, Utensils } from "lucide-react";

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
      content: "Hey! I'm FiMe — your personal nutrition assistant 🥗\nWant help creating a healthy meal from what you have at home?"
    }],
    ingredientsInput: '',
    selectedGoals: [],
    cookingTime: 30
  });
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            content: "What are your goals for this meal?"
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
        { role: 'user', content: goals.join(', ') },
        {
          role: 'assistant',
          content: `How many minutes do you have to cook?`
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
        { role: 'assistant', content: "Thinking of something delicious just for you... 🍳" }
      ],
      cookingTime: time
    });

    // Navigate to recipe preview with form data
    setTimeout(() => {
      navigate("/recipe/preview", { 
        state: { 
          formData: {
            ingredients: chatState.ingredientsInput,
            goals: chatState.selectedGoals,
            cookingTime: time
          } 
        } 
      });
    }, 1500);
  };

  // Render appropriate input based on current step
  const renderInputBasedOnStep = () => {
    switch (chatState.step) {
      case 'welcome':
        return (
          <div className="w-full flex flex-col items-center">
            <Button 
              onClick={handleStepForward} 
              className="mt-4 px-6 py-2 bg-[#FF6F61] hover:bg-[#ff5d4d] text-white"
              size="lg"
            >
              Get Started <ArrowDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      
      case 'ingredients':
        return (
          <div className="flex space-x-2 w-full">
            <Input
              placeholder="Type your ingredients here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
              className="flex-grow border-[#F8BBD0] focus:border-[#FF6F61] focus-visible:ring-[#FF6F61]"
            />
            <Button 
              onClick={handleUserInput}
              className="bg-[#FF6F61] hover:bg-[#ff5d4d]"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="border-[#F8BBD0]" disabled>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        );
      
      case 'goals':
        return (
          <div className="space-y-4 w-full">
            <div className="flex flex-wrap gap-2 justify-center">
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
                  className={chatState.selectedGoals.includes(goal) 
                    ? "bg-[#FF6F61] hover:bg-[#ff5d4d] border-[#FF6F61]" 
                    : "border-[#F8BBD0] hover:border-[#FF6F61]"
                  }
                >
                  {goal}
                  {chatState.selectedGoals.includes(goal) && <Check className="ml-2 h-4 w-4" />}
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => handleSelectGoals(chatState.selectedGoals)}
              disabled={chatState.selectedGoals.length === 0}
              className="w-full bg-[#FF6F61] hover:bg-[#ff5d4d]"
            >
              Continue
            </Button>
          </div>
        );
      
      case 'cookingTime':
        return (
          <div className="space-y-4 w-full">
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
                className="border-[#F8BBD0] focus:border-[#FF6F61] focus-visible:ring-[#FF6F61]"
              />
              <span className="text-muted-foreground">minutes</span>
            </div>
            <Button 
              onClick={() => handleSetCookingTime(chatState.cookingTime)}
              className="w-full bg-[#FF6F61] hover:bg-[#ff5d4d]"
            >
              Find Me a Recipe
            </Button>
          </div>
        );
      
      case 'generating':
        return (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Loader className="h-5 w-5 animate-spin text-[#FF6F61]" />
            <div className="text-muted-foreground">Thinking of something delicious just for you...</div>
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
        messages: [
          ...chatState.messages,
          { 
            role: 'assistant', 
            content: "What ingredients do you currently have at home?" 
          }
        ]
      });
    } else {
      handleUserInput();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-xl mx-auto">
      {/* Chat Messages */}
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
                <Avatar className="h-8 w-8 mr-2 bg-[#FFDAB9] text-foreground">
                  <span className="font-bold">Fi</span>
                </Avatar>
              )}
              <div 
                className={`rounded-2xl px-4 py-2 ${
                  message.role === 'assistant' 
                    ? 'bg-[#F8BBD0] bg-opacity-30 text-foreground rounded-tl-none' 
                    : 'bg-[#FF6F61] text-white rounded-tr-none'
                }`}
              >
                {message.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t p-4 bg-background">
        {renderInputBasedOnStep()}
      </div>
    </div>
  );
};
