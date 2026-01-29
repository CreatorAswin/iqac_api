import React, { createContext, useContext, useState, useCallback } from 'react';
import { localApi } from '@/services/localApi';

export type UserRole = 'admin' | 'management' | 'iqac' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check for stored user on mount
    const stored = localStorage.getItem('iqac_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await localApi.login(email, password);

      if (response.success && response.data) {
        const userData: User = {
          id: response.data.user.id || response.data.user.email,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role.toLowerCase() as UserRole,
          status: response.data.user.status?.toLowerCase() as 'active' | 'inactive' || 'active',
        };
        setUser(userData);
        localStorage.setItem('iqac_user', JSON.stringify(userData));
        return { success: true };
      }

      return { success: false, error: response.error || 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Unable to connect to server. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await localApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('iqac_user');
      localStorage.removeItem('iqac_token');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
