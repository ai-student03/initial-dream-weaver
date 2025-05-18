
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecipeImagePromptProps {
  prompt: string;
  onImageReceived?: (imageUrl: string) => void;
}

const RecipeImagePrompt = ({ prompt, onImageReceived }: RecipeImagePromptProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    const generateImage = async () => {
      if (!prompt || isSent) return;
      
      try {
        setIsSending(true);
        console.log("Generating image with prompt:", prompt);
        
        // Create a fallback that will be used if the image generation takes too long
        const fallbackTimer = setTimeout(() => {
          if (!isSent) {
            console.log("Image generation taking too long, using fallback...");
            useFallbackImage();
          }
        }, 3000);
        
        setIsGenerating(true);
        
        // Call the Supabase Edge Function instead of the webhook
        const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
          body: { 
            prompt: prompt,
            recipeName: prompt.split(':')[0] || 'Recipe'
          }
        });
        
        clearTimeout(fallbackTimer);
        
        if (error) {
          console.error("Supabase function error:", error);
          throw new Error(`Error calling image generation function: ${error.message}`);
        }
        
        console.log("Image generation response:", data);
        
        if (data?.imageUrl) {
          console.log("Successfully generated image:", data.imageUrl);
          setIsSent(true);
          
          if (onImageReceived) {
            onImageReceived(data.imageUrl);
          }
        } else {
          throw new Error("No image URL in response");
        }
      } catch (error) {
        console.error("Error generating image:", error);
        toast({
          title: "Image Generation Error",
          description: "Unable to generate recipe image. Using a stock image instead.",
          variant: "destructive",
        });
        
        // Use fallback image on error
        useFallbackImage();
      } finally {
        setIsSending(false);
        setIsGenerating(false);
      }
    };
    
    const useFallbackImage = () => {
      // Create a fallback image URL with recipe keywords
      const keywords = prompt
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 5)
        .join(',');
      
      const fallbackUrl = `https://source.unsplash.com/featured/?food,${encodeURIComponent(keywords)}&${Date.now()}`;
      console.log("Using fallback image URL:", fallbackUrl);
      
      setIsSent(true);
      
      if (onImageReceived) {
        onImageReceived(fallbackUrl);
      }
    };
    
    if (prompt) {
      generateImage();
    }
  }, [prompt, onImageReceived, isSent]);
  
  if (!prompt) return null;
  
  return (
    <Card className="bg-[#FFDAB9] bg-opacity-20 border-[#F8BBD0]">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-center">
          {isSending ? (
            <div className="flex flex-col items-center">
              <Loader className="h-5 w-5 animate-spin text-[#FF6F61] mb-2" />
              <p className="text-sm text-muted-foreground">
                {isGenerating ? "Generating your recipe image..." : "Preparing recipe image..."}
              </p>
            </div>
          ) : isSent ? (
            <p className="text-sm text-muted-foreground">Recipe image generated successfully!</p>
          ) : (
            <p className="text-sm text-muted-foreground">Preparing your recipe image...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeImagePrompt;
