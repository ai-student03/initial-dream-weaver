
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
        
        if (!response.ok) {
          throw new Error(`Webhook responded with status: ${response.status}`);
        }
        
        console.log("Webhook request sent successfully");
        setIsSent(true);
        
        // Set up event listener for the webhook response
        const eventSourceUrl = `${webhookUrl}/listen`;
        console.log("Setting up EventSource at:", eventSourceUrl);
        
        const eventSource = new EventSource(eventSourceUrl);
        setIsEventSourceActive(true);
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received webhook response:", data);
            
            if (data.imageUrl) {
              console.log("Image URL received:", data.imageUrl);
              
              // Verify the URL format and make sure it's using HTTPS
              try {
                let urlToUse = data.imageUrl;
                // If the URL doesn't start with http, add https://
                if (!urlToUse.startsWith('http')) {
                  urlToUse = 'https://' + urlToUse;
                }
                // If using HTTP, change to HTTPS
                if (urlToUse.startsWith('http://')) {
                  urlToUse = urlToUse.replace('http://', 'https://');
                }
                
                const url = new URL(urlToUse);
                console.log("Validated image URL:", url.toString());
                
                // Call the callback function with the validated image URL
                if (onImageReceived) {
                  onImageReceived(url.toString());
                }
                
                toast({
                  title: "Image received!",
                  description: "The AI-generated image for your recipe is ready.",
                  variant: "default",
                });
              } catch (urlError) {
                console.error("Invalid URL format:", urlError);
                // Use a fallback image
                const fallbackUrl = `https://source.unsplash.com/featured/?food,cooking,${prompt.replace(/\s+/g, ',')}`;
                console.log("Using fallback image URL due to format error:", fallbackUrl);
                
                if (onImageReceived) {
                  onImageReceived(fallbackUrl);
                }
              }
              
              // Close the event source
              eventSource.close();
              setIsEventSourceActive(false);
            }
          } catch (err) {
            console.error("Error parsing webhook response:", err);
          }
        };
        
        eventSource.onerror = (err) => {
          console.error("EventSource error:", err);
          eventSource.close();
          setIsEventSourceActive(false);
          
          // If there's an error with the EventSource, use fallback image
          const fallbackUrl = `https://source.unsplash.com/featured/?food,cooking,${prompt.replace(/\s+/g, ',')}`;
          console.log("Using fallback image URL due to EventSource error:", fallbackUrl);
          
          if (onImageReceived) {
            onImageReceived(fallbackUrl);
          }
        };
        
        // Set a timeout to close the event source after 30 seconds
        setTimeout(() => {
          if (eventSource.readyState !== 2) { // 2 means CLOSED
            console.log("Closing event source after timeout");
            eventSource.close();
            setIsEventSourceActive(false);
            
            // Provide fallback image after timeout
            const fallbackUrl = `https://source.unsplash.com/featured/?food,cooking,${prompt.replace(/\s+/g, ',')}`;
            console.log("Using fallback image URL due to timeout:", fallbackUrl);
            
            if (onImageReceived) {
              onImageReceived(fallbackUrl);
            }
          }
        }, 20000); // 20 seconds timeout
        
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
        
        // Provide fallback image on error
        const fallbackUrl = `https://source.unsplash.com/featured/?food,cooking,${prompt.replace(/\s+/g, ',')}`;
        console.log("Using fallback image URL due to webhook error:", fallbackUrl);
        
        if (onImageReceived) {
          onImageReceived(fallbackUrl);
        }
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
          ) : isEventSourceActive ? (
            <div className="flex flex-col items-center">
              <Loader className="h-5 w-5 animate-spin text-[#FF6F61] mb-2" />
              <p className="text-sm text-muted-foreground">Waiting for AI-generated image...</p>
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
