// src/components/auth/AuthContext.tsx
"use client";

import type { User, UserRole } from '@/types';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { mockUsers, getMockUserByRole } from '@/data/mock';
import { defaultUserRole } from '@/config/site';

// Define the shape of the authentication context
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  signup: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  setUserRole: (role: UserRole) => void; // For demo purposes to switch roles
}

// Create the context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Effect to check for an existing session (e.g., from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, role: UserRole) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser = mockUsers.find(u => u.email === email && u.role === role) || getMockUserByRole(role);
    
    if (mockUser) {
      const userToStore = { ...mockUser, email: email || mockUser.email, role }; // Ensure email and role are set
      setUser(userToStore);
      localStorage.setItem('authUser', JSON.stringify(userToStore));
      router.push('/dashboard');
    } else {
      // Handle login failure (e.g., show a toast message)
      console.error("Login failed: User not found or role mismatch");
      alert("Login failed. Please check your credentials or selected role.");
    }
    setIsLoading(false);
  }, [router]);

  const signup = useCallback(async (email: string, role: UserRole) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0], // Simple name generation
      role,
      avatarUrl: 'https://placehold.co/100x100',
    };
    setUser(newUser);
    localStorage.setItem('authUser', JSON.stringify(newUser));
    // mockUsers.push(newUser); // In a real app, this would be a backend operation
    router.push('/dashboard');
    setIsLoading(false);
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('authUser');
    router.push('/auth/login');
  }, [router]);

  const setUserRole = useCallback((role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      // Optionally, navigate to a relevant page or refresh
      router.refresh(); // Or router.push('/dashboard') if preferred
    } else {
      // If no user is logged in, log in with the selected role
      // This is a simplified demo behavior
      const mockUserForRole = getMockUserByRole(role);
      setUser(mockUserForRole);
      localStorage.setItem('authUser', JSON.stringify(mockUserForRole));
      router.push('/dashboard');
    }
  }, [user, router]);


  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    setUserRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
