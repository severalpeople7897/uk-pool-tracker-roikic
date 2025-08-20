
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../app/integrations/supabase/client';
import { Alert } from 'react-native';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const createOrUpdateUserProfile = useCallback(async (user: User) => {
    try {
      console.log('Creating/updating user profile for:', user.email);
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            name: user.name || user.email.split('@')[0],
            email: user.email,
          });

        if (error) {
          console.log('Error creating user profile:', error);
        } else {
          console.log('User profile created successfully');
        }
      } else {
        console.log('User profile already exists');
      }
    } catch (error) {
      console.log('Error creating/updating user profile:', error);
    }
  }, []);

  const checkAuthState = useCallback(async () => {
    try {
      console.log('Checking auth state...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          created_at: session.user.created_at,
        };
        
        console.log('User authenticated:', user.email);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
        
        // Create or update user profile
        await createOrUpdateUserProfile(user);
      } else {
        console.log('No authenticated user found');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    } catch (error) {
      console.log('Error checking auth state:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    }
  }, [createOrUpdateUserProfile]);

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          created_at: session.user.created_at,
        };
        
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
        
        // Create or update user profile
        await createOrUpdateUserProfile(user);
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuthState, createOrUpdateUserProfile]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Login error:', error);
        return { success: false, message: error.message };
      }

      console.log('Login successful');
      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('Attempting registration for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name: name,
          }
        }
      });

      if (error) {
        console.log('Registration error:', error);
        return { success: false, message: error.message };
      }

      if (data.user && !data.session) {
        console.log('Registration successful, email verification required');
        return { 
          success: true, 
          message: 'Registration successful! Please check your email to verify your account before logging in.' 
        };
      }

      console.log('Registration successful');
      return { success: true };
    } catch (error) {
      console.log('Registration error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('Logout error:', error);
        Alert.alert('Error', 'Failed to logout. Please try again.');
      } else {
        console.log('Logout successful');
        // The auth state change listener will handle updating the state
      }
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
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
