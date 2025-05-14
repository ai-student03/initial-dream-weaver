
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface RecipeEmailPromptProps {
  recipe: Recipe;
  onSendEmail: (email?: string) => Promise<void>;
  emailLoading: boolean;
  emailSent: boolean;
}

const RecipeEmailPrompt = ({ recipe, onSendEmail, emailLoading, emailSent }: RecipeEmailPromptProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  
  const handleSendClick = () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }
    
    if (email) {
      onSendEmail(email);
    }
  };
  
  return (
    <div className="mt-6 p-4 bg-[#FFDAB9] bg-opacity-20 rounded-lg">
      <p className="text-center mb-4">Like this recipe? Want me to send it to your email?</p>
      
      {showEmailInput && !emailSent && (
        <div className="mb-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="mb-2"
          />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={handleSendClick} 
          disabled={emailLoading || emailSent || (showEmailInput && !email)}
          className="bg-[#FF6F61] hover:bg-[#ff5d4d] flex-1"
        >
          {emailLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" /> Sending...
            </>
          ) : emailSent ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Sent!
            </>
          ) : showEmailInput ? (
            <>
              <Mail className="mr-2 h-4 w-4" /> Send Recipe
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" /> Send to my email
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/nutrition')}
          className="border-[#F8BBD0] hover:border-[#FF6F61] flex-1"
        >
          Back to chat
        </Button>
      </div>
    </div>
  );
};

export default RecipeEmailPrompt;
