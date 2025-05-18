
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RecipeImagePromptProps {
  prompt: string;
  onImageReceived?: (imageUrl: string) => void;
}

const RecipeImagePrompt = ({ prompt, onImageReceived }: RecipeImagePromptProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isEventSourceActive, setIsEventSourceActive] = useState(false);
  const [webhookError, setWebhookError] = useState(false);
  const webhookUrl = 'https://hook.eu2.make.com/uaqgnkl0rayez59wide2zfemmipykhie';
  
  useEffect(() => {
    const sendPromptToWebhook = async () => {
      if (!prompt || isSent) return;
      
      try {
        setIsSending(true);
        console.log("Sending image prompt to webhook:", prompt);
        
        // Set a timeout for the webhook request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imagePrompt: prompt,
            timestamp: new Date().toISOString()
          }),
          signal: controller.signal
        }).catch(error => {
          console.error("Fetch error:", error);
          throw new Error("Network error when connecting to the webhook");
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Webhook responded with status: ${response.status}`);
        }
        
        console.log("Webhook request sent successfully");
        setIsSent(true);
        
        // Set up event listener for the webhook response with a fallback
        setTimeout(() => {
          // If we're still waiting after 2 seconds, provide a fallback image
          if (!webhookError) {
            console.log("Using fallback image due to slow webhook response");
            useFallbackImage();
          }
        }, 2000);
        
      } catch (error) {
        console.error("Error sending prompt to webhook:", error);
        setWebhookError(true);
        toast({
          title: "Image Generation Error",
          description: "Unable to connect to image service. Using a stock image instead.",
          variant: "destructive",
        });
        
        // Use fallback image on error
        useFallbackImage();
      } finally {
        setIsSending(false);
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
      
      if (onImageReceived) {
        onImageReceived(fallbackUrl);
      }
    };
    
    if (prompt) {
      sendPromptToWebhook();
    }
  }, [prompt, webhookUrl, isSent, onImageReceived]);
  
  if (!prompt) return null;
  
  return (
    <Card className="bg-[#FFDAB9] bg-opacity-20 border-[#F8BBD0]">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-center">
          {isSending ? (
            <div className="flex flex-col items-center">
              <Loader className="h-5 w-5 animate-spin text-[#FF6F61] mb-2" />
              <p className="text-sm text-muted-foreground">Preparing recipe image...</p>
            </div>
          ) : webhookError ? (
            <p className="text-sm text-muted-foreground">Using a stock food image for your recipe.</p>
          ) : isSent ? (
            <p className="text-sm text-muted-foreground">Image request sent! Your recipe will display shortly.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Preparing your recipe image...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeImagePrompt;
