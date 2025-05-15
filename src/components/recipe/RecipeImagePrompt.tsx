
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
  const webhookUrl = 'https://hook.eu2.make.com/uaqgnkl0rayez59wide2zfemmipykhie';
  
  useEffect(() => {
    const sendPromptToWebhook = async () => {
      if (!prompt || isSent) return;
      
      try {
        setIsSending(true);
        console.log("Sending image prompt to webhook:", prompt);
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imagePrompt: prompt,
            timestamp: new Date().toISOString()
          }),
        });
        
        console.log("Webhook request sent");
        setIsSent(true);
        
        // Set up event listener for the webhook response
        const eventSource = new EventSource(`${webhookUrl}/listen`);
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received webhook response:", data);
            
            if (data.imageUrl) {
              console.log("Image URL received:", data.imageUrl);
              
              // Call the callback function with the image URL
              if (onImageReceived) {
                onImageReceived(data.imageUrl);
              }
              
              toast({
                title: "Image received!",
                description: "The AI-generated image for your recipe is ready.",
                variant: "default",
              });
              
              // Close the event source
              eventSource.close();
            }
          } catch (err) {
            console.error("Error parsing webhook response:", err);
          }
        };
        
        eventSource.onerror = (err) => {
          console.error("EventSource error:", err);
          eventSource.close();
        };
        
        // Set a timeout to close the event source after 30 seconds
        setTimeout(() => {
          if (eventSource.readyState !== 2) { // 2 means CLOSED
            console.log("Closing event source after timeout");
            eventSource.close();
          }
        }, 30000);
        
        toast({
          title: "Image prompt sent!",
          description: "The image prompt was sent to the image generation service.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error sending prompt to webhook:", error);
        toast({
          title: "Error",
          description: "Failed to send the image prompt to the service.",
          variant: "destructive",
        });
      } finally {
        setIsSending(false);
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
              <p className="text-sm text-muted-foreground">Sending image prompt to generation service...</p>
            </div>
          ) : isSent ? (
            <p className="text-sm text-muted-foreground">Image prompt sent! Waiting for the generated image...</p>
          ) : (
            <p className="text-sm text-muted-foreground">Processing image prompt...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeImagePrompt;
