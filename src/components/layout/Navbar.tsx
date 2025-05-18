
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };
  
  // Don't show navigation on auth page
  if (location.pathname === '/auth') {
    return null;
  }
  
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2 text-lg font-bold text-primary">
          <span>FiMe</span>
        </Link>
        
        <nav className="flex-1 flex items-center">
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary/50">
              Create Recipe
            </Link>
            {user && (
              <>
                <Link to="/saved-recipes" className="text-sm font-medium transition-colors hover:text-primary/50">
                  Saved Recipes
                </Link>
                <Link to="/history" className="text-sm font-medium transition-colors hover:text-primary/50">
                  History
                </Link>
              </>
            )}
          </div>
          
          <div className="flex-1 flex justify-end">
            {user ? (
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
