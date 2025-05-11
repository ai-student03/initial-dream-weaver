
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Don't show mobile navigation on auth page
  if (location.pathname === '/auth') {
    return null;
  }
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-10 w-full border-t bg-background">
      <div className="grid grid-cols-3 h-14">
        <Link 
          to="/"
          className={`flex flex-col items-center justify-center text-xs ${
            location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
            <line x1="6" x2="18" y1="17" y2="17"></line>
          </svg>
          <span className="mt-1">Create</span>
        </Link>
        
        <Link 
          to="/saved-recipes"
          className={`flex flex-col items-center justify-center text-xs ${
            location.pathname.includes('/saved-recipes') || location.pathname.includes('/recipe/') 
              ? 'text-primary' 
              : 'text-muted-foreground'
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span className="mt-1">Saved</span>
        </Link>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex flex-col items-center justify-center w-full text-xs text-muted-foreground">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="10" r="3"></circle>
                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
              </svg>
              <span className="mt-1">Profile</span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="absolute bottom-14 right-0 w-36 border rounded-lg bg-background shadow-lg p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sm"
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
            >
              Sign Out
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default MobileNav;
