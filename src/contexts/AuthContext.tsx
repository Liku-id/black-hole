import { useAuth as useAuthHook } from '@/hooks/useAuth';
import { AuthUser, LoginDto, Role, User } from '@/models/user';
import React, { createContext, ReactNode, useContext } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (loginData: LoginDto) => Promise<string | null>;
  logout: (userId?: string) => Promise<void>;
  hasRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
  isPartner: () => boolean;
  isBuyer: () => boolean;
  getUserById: (id: string) => Promise<User | null>;
  getUserByEmail: (email: string) => Promise<User | null>;
  getAllUsers: () => Promise<User[]>;
  getAllRoles: () => Promise<Role[]>;
  validateUserData: (userData: Partial<User>) => string[];
  isValidEmail: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authHook = useAuthHook();

  return (
    <AuthContext.Provider value={authHook}>
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