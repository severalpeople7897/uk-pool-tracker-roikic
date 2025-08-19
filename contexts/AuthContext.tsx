
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '@pool_league_user',
  USERS: '@pool_league_users',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (userJson) {
        const user = JSON.parse(userJson);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
      } else {
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
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get stored users
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Find user with matching email and password
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
        setAuthState({
          isAuthenticated: true,
          user: userWithoutPassword,
          loading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        return false;
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        createdAt: new Date().toISOString(),
      };
      
      // Save to users list
      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      // Auto-login the new user
      const { password: _, ...userWithoutPassword } = newUser;
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
      setAuthState({
        isAuthenticated: true,
        user: userWithoutPassword,
        loading: false,
      });
      
      return true;
    } catch (error) {
      console.log('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

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
