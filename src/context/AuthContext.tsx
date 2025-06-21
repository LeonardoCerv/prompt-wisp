'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import SupabaseUser from '@/lib/models/supabase-user';

// Define user interface
export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing session on initial load and set up auth listener
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current user from Supabase
        const currentUser = await SupabaseUser.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const currentUser = await SupabaseUser.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
            }
          } catch (err) {
            console.error('Error getting user after sign in:', err);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let userData: User;
      
      // Try to determine if identifier is email or username
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        userData = await SupabaseUser.signInWithEmail(identifier, password);
      } else {
        userData = await SupabaseUser.signInWithUsername(identifier, password);
      }
      
      setUser(userData);
      
      // Redirect to home page
      router.push('/home');
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await SupabaseUser.create(username, email, password);
      
      setUser(userData);
      
      // Redirect to home page
      router.push('/home');
      
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      await SupabaseUser.signOut();
      
      // Clear user state
      setUser(null);
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to home page
      router.push('/');
      
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to log out';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}