
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Heart, Loader, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface RecipeEmailPromptProps {
  recipe: Recipe;
  onSendEmail: (email?: string) => Promise<void>;
  onSaveRecipe?: () => Promise<void>;
  emailLoading: boolean;
  emailSent: boolean;
  saveLoading?: boolean;
  savedRecipe?: boolean;
}

const RecipeEmailPrompt = ({ 
  recipe, 
  onSendEmail, 
  onSaveRecipe,
  emailLoading, 
  emailSent,
  saveLoading,
  savedRecipe
}: RecipeEmailPromptProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  
  const handleSendClick = () => {
    if (!showEmailInput) {
      setShowEmailInput(true);
      return;
    }
    
    onSendEmail(email || undefined);
  };
  
  return (
    <div className="mt-6 p-4 bg-[#FFDAB9] bg-opacity-20 rounded-lg">
      <p className="text-center mb-4">Want to save this recipe?</p>
      
      {showEmailInput && !emailSent && (
        <div className="mb-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address (optional)"
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground text-center">Leave blank to use your account email</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onSaveRecipe && (
          <Button 
            onClick={onSaveRecipe} 
            disabled={saveLoading || savedRecipe}
            variant="outline"
            className="border-fime-green hover:bg-fime-green/10 flex-1"
          >
            {saveLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : savedRecipe ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Saved!
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" /> 💚 Save to My Recipes
              </>
            )}
          </Button>
        )}
        
        <Button 
          onClick={handleSendClick} 
          disabled={emailLoading || emailSent}
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
