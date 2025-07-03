import { AuthUser, LoginDto } from '@/models/user';
import { userService } from '@/services/userService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (loginData: LoginDto) => Promise<string | null>;
  logout: () => void;
  hasRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (loginData: LoginDto): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { user, error } = await userService.authenticate(loginData);
      if (error) return error;
      setUser(user!);
      setIsLoggedIn(true);
      localStorage.setItem('authUser', JSON.stringify(user));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('authUser');
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return userService.hasRole(user, roleName);
  };

  const isAdmin = (): boolean => {
    if (!user) return false;
    return userService.isAdmin(user);
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn, 
      isLoading, 
      login, 
      logout, 
      hasRole, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 