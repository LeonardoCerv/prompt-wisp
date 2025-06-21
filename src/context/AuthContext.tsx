'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

// Define simplified user interface
export interface User {
  id: number;
  username: string;
  email: string;
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

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Try to get user from cookie first
        const storedUser = Cookies.get('user');
        
        if (storedUser) {
          // If user exists in cookies, parse it
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          // If no user in cookies, check with the server for a valid session
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUser(data.user);
              
              // Set client-side cookie with explicit expiration
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
              
              Cookies.set('user', JSON.stringify(data.user), { 
                expires: expiryDate,
                path: '/',
                secure: window.location.protocol === 'https:'
              });
            }
          }
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier, 
          password 
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }
      
      const { user: userData } = data;
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Store the user in state and cookies
      setUser(userData);
      
      // Set client-side cookie with explicit expiration
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
      
      const userJson = JSON.stringify(userData);
      
      Cookies.set('user', userJson, { 
        expires: expiryDate,
        path: '/',
        secure: window.location.protocol === 'https:'
      });
      
      // Also store in localStorage as backup
      localStorage.setItem('wisp_user', userJson);
      
      // Redirect to home page
      router.push('/');
      
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password 
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      
      const { user: userData } = data;
      
      if (!userData) {
        throw new Error('Failed to create user');
      }
      
      // Store the user in state and cookies
      setUser(userData);
      
      // Set client-side cookie with explicit expiration
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
      
      const userJson = JSON.stringify(userData);
      
      Cookies.set('user', userJson, { 
        expires: expiryDate,
        path: '/',
        secure: window.location.protocol === 'https:'
      });
      
      // Also store in localStorage as backup
      localStorage.setItem('wisp_user', userJson);
      
      // Redirect to home page
      router.push('/');
      
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
      
      // Call the API to remove the HTTP-only cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Remove client-side cookie
      Cookies.remove('user');
      
      // Remove from localStorage too
      localStorage.removeItem('wisp_user');
      
      // Clear user state
      setUser(null);
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to home page
      router.push('/');
      
    } catch (err) {
      console.error('Logout error:', err);
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