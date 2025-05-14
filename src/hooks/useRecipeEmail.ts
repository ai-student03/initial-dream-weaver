
import { useState } from 'react';
import { Recipe } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRecipeEmail = () => {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const sendRecipeEmail = async (recipe: Recipe) => {
    if (!recipe) return;
    
    try {
      setEmailLoading(true);
      
      // Get the user's email - in a real app this would come from authentication
      const userEmail = prompt("Please enter your email address:");
      
      if (!userEmail) {
        setEmailLoading(false);
        return;
      }
      
      // Call the send-recipe-email function
      const { data, error } = await supabase.functions.invoke('send-recipe-email', {
        body: {
          recipe,
          email: userEmail
        }
      });
      
      if (error) throw error;
      
      toast.success('Recipe sent to your email!');
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send the email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  return { emailLoading, emailSent, sendRecipeEmail };
};
