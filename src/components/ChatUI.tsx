
import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NutritionGoal, Recipe } from "@/lib/types";
import { useNavigate } from 'react-router-dom';
import { Send, Mic, ArrowDown, Check, Loader, MessageSquare } from "lucide-react";

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

    const updatedMessages = [...chatState.messages, { role: 'user' as const, content: userInput }];
    
    // Add user's message and process based on current step
    if (chatState.step === 'ingredients') {
      // Save ingredients and ask for goals
      setChatState({
        ...chatState,
        step: 'goals',
        messages: [
          ...updatedMessages,
          {
            role: 'assistant' as const,
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
        { role: 'user' as const, content: goals.join(', ') },
        {
          role: 'assistant' as const,
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
        { role: 'user' as const, content: `${time} minutes` },
        { role: 'assistant' as const, content: "Thinking of something delicious just for you... 🍳" }
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
              className="mt-6 px-8 py-6 bg-[#8BC791] hover:bg-[#7AB682] text-white text-lg rounded-full shadow-md transition-all"
              size="lg"
            >
              Get Started <ArrowDown className="ml-2 h-5 w-5" />
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
              className="flex-grow border-[#FEC6A1] focus:border-[#8BC791] focus-visible:ring-[#8BC791] rounded-full py-6 text-base shadow-sm"
            />
            <Button 
              onClick={handleUserInput}
              className="bg-[#8BC791] hover:bg-[#7AB682] rounded-full shadow-sm"
              size="lg"
            >
              <Send className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-[#FEC6A1] rounded-full shadow-sm" disabled size="lg">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        );
      
      case 'goals':
        return (
          <div className="space-y-6 w-full">
            <div className="flex flex-wrap gap-3 justify-center">
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
                    ? "bg-[#8BC791] hover:bg-[#7AB682] border-[#8BC791] rounded-full shadow-sm" 
                    : "border-[#FEC6A1] hover:border-[#8BC791] hover:bg-[#F1F0FB] rounded-full shadow-sm"
                  }
                  size="lg"
                >
                  {goal}
                  {chatState.selectedGoals.includes(goal) && <Check className="ml-2 h-4 w-4" />}
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => handleSelectGoals(chatState.selectedGoals)}
              disabled={chatState.selectedGoals.length === 0}
              className="w-full bg-[#8BC791] hover:bg-[#7AB682] rounded-full py-6 shadow-md text-lg"
              size="lg"
            >
              Continue
            </Button>
          </div>
        );
      
      case 'cookingTime':
        return (
          <div className="space-y-6 w-full">
            <div className="flex items-center space-x-3 bg-[#F1F0FB] p-4 rounded-2xl shadow-sm">
              <Input
                type="number"
                min="5"
                max="180"
                value={chatState.cookingTime}
                onChange={(e) => setChatState({ 
                  ...chatState, 
                  cookingTime: parseInt(e.target.value) || 30 
                })}
                className="border-[#FEC6A1] focus:border-[#8BC791] focus-visible:ring-[#8BC791] rounded-full text-lg"
                size={5}
              />
              <span className="text-lg text-muted-foreground">minutes</span>
            </div>
            <Button 
              onClick={() => handleSetCookingTime(chatState.cookingTime)}
              className="w-full bg-[#8BC791] hover:bg-[#7AB682] rounded-full py-6 shadow-md text-lg"
              size="lg"
            >
              Find Me a Recipe
            </Button>
          </div>
        );
      
      case 'generating':
        return (
          <div className="flex items-center justify-center space-x-2 py-6 bg-[#F1F0FB] rounded-2xl shadow-sm">
            <Loader className="h-6 w-6 animate-spin text-[#8BC791]" />
            <div className="text-lg">Thinking of something delicious just for you...</div>
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
            role: 'assistant' as const, 
            content: "What ingredients do you currently have at home?" 
          }
        ]
      });
    } else {
      handleUserInput();
    }
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-[#F1F0FB]">
      {/* Welcome Card for the first step */}
      {chatState.step === 'welcome' && (
        <div className="p-6 bg-gradient-to-r from-[#F2FCE2] to-[#F1F0FB] rounded-t-3xl">
          <div className="flex items-start space-x-4 mb-6">
            <div className="bg-white p-3 rounded-full shadow-md">
              <MessageSquare className="h-8 w-8 text-[#8BC791]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">Welcome to FiMe</h2>
              <p className="text-gray-600">
                I'll help you create delicious, healthy meals with ingredients you already have at home.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[500px] min-h-[300px]">
        {chatState.messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-bubble-in`}
          >
            <div 
              className={`flex max-w-[80%] ${
                message.role === 'assistant' ? 'items-start' : 'items-end flex-row-reverse'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-10 w-10 mr-2 bg-[#F2FCE2] text-foreground border border-[#8BC791] shadow-sm">
                  <span className="font-bold text-[#8BC791]">Fi</span>
                </Avatar>
              )}
              <div 
                className={`rounded-2xl px-5 py-3 shadow-sm ${
                  message.role === 'assistant' 
                    ? 'bg-[#F2FCE2] text-foreground rounded-tl-none' 
                    : 'bg-[#8BC791] text-white rounded-tr-none'
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
      <div className="border-t border-[#F1F0FB] p-5 bg-white">
        {renderInputBasedOnStep()}
      </div>
    </div>
  );
};
