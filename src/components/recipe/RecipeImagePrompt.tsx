
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RecipeImagePromptProps {
  prompt: string;
}

const RecipeImagePrompt = ({ prompt }: RecipeImagePromptProps) => {
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied!",
      description: "Image prompt copied to clipboard",
      variant: "default",
    });
  };
  
  if (!prompt) return null;
  
  return (
    <Card className="bg-[#FFDAB9] bg-opacity-20 border-[#F8BBD0]">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-2">
          <ImageIcon className="h-5 w-5 mt-1 text-[#FF6F61]" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">AI Image Prompt</h4>
            <p className="text-sm text-muted-foreground mb-2">{prompt}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1 text-xs border-[#F8BBD0] hover:border-[#FF6F61]"
              onClick={handleCopyPrompt}
            >
              <Copy className="h-3 w-3 mr-1" /> Copy Prompt
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeImagePrompt;
