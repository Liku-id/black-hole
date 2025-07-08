import { authApi } from '@/api/auth';
import { ApiError } from '@/api/error';
import { hasRole as hasRoleUtil, isAdminRole } from '@/models/roles';
import { AuthUser, LoginDto, MOCK_ROLES, MOCK_USERS, Role, User } from '@/models/user';
import { useCallback, useEffect, useState } from 'react';
import { useToken } from './useToken';

/**
 * Authentication and user management hook
 * Provides authentication, user management, and role checking functionality
 */
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const token = useToken();

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in on mount
    const checkAuthStatus = () => {
      if (token.isAuthenticated()) {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsLoggedIn(true);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('authUser');
            token.clearTokens();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  /**
   * Authenticate user with email and password
   */
  const login = useCallback(async (loginData: LoginDto): Promise<string | null> => {
    setIsLoading(true);
    try {
      const result = await authApi.login(loginData);
      if (result.error) {
        return result.error;
      }
      
      if (result.user) {
        setUser(result.user);
        setIsLoggedIn(true);
        localStorage.setItem('authUser', JSON.stringify(result.user));
        // Save tokens
        token.setTokens(result.user.accessToken, result.user.refreshToken);
        return null;
      }
      
      return 'Login failed';
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle ApiError specifically
      if (error instanceof ApiError) {
        return error.message;
      }
      
      // Handle other Error types
      if (error instanceof Error) {
        return error.message;
      }
      
      return 'An unexpected error occurred during login';
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Logout user
   */
  const logout = useCallback(async (userId?: string): Promise<void> => {
    const currentUserId = userId || user?.id;
    if (currentUserId) {
      await authApi.logout(currentUserId);
    }
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('authUser');
    token.clearTokens();
  }, [user, token]);

  /**
   * Get user by ID
   */
  const getUserById = useCallback(async (id: string): Promise<User | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const user = MOCK_USERS.find(u => u.id === id);
      return user || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }, []);

  /**
   * Get user by email
   */
  const getUserByEmail = useCallback(async (email: string): Promise<User | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const user = MOCK_USERS.find(u => u.email === email);
      return user || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }, []);

  /**
   * Get all users (for admin purposes)
   */
  const getAllUsers = useCallback(async (): Promise<User[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return MOCK_USERS.map(user => ({
        ...user,
        password: '***' // Hide password in list
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }, []);

  /**
   * Get all roles
   */
  const getAllRoles = useCallback(async (): Promise<Role[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return MOCK_ROLES;
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }, []);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((roleName: string): boolean => {
    if (!user) return false;
    return hasRoleUtil(user.roleId, roleName as 'admin' | 'partner' | 'buyer');
  }, [user]);

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback((): boolean => {
    if (!user) return false;
    return isAdminRole(user.roleId);
  }, [user]);

  /**
   * Check if user is partner
   */
  const isPartner = useCallback((): boolean => {
    if (!user) return false;
    return hasRole('partner');
  }, [hasRole]);

  /**
   * Check if user is buyer
   */
  const isBuyer = useCallback((): boolean => {
    if (!user) return false;
    return hasRole('buyer');
  }, [hasRole]);

  /**
   * Validate user data
   */
  const validateUserData = useCallback((userData: Partial<User>): string[] => {
    const errors: string[] = [];

    if (!userData.fullName || userData.fullName.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!userData.email || !isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }

    if (!userData.phoneNumber || userData.phoneNumber.trim().length < 10) {
      errors.push('Valid phone number is required');
    }

    if (!userData.ktpNumber || userData.ktpNumber.trim().length !== 16) {
      errors.push('KTP Number must be exactly 16 characters');
    }

    if (!userData.gender || !['male', 'female'].includes(userData.gender)) {
      errors.push('Valid gender is required');
    }

    return errors;
  }, []);

  /**
   * Validate email format
   */
  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  if (!mounted) {
    return {
      user: null,
      isLoggedIn: false,
      isLoading: true,
      login: () => Promise.resolve('Not mounted'),
      logout: () => Promise.resolve(),
      hasRole: () => false,
      isAdmin: () => false,
      isPartner: () => false,
      isBuyer: () => false,
      getUserById: () => Promise.resolve(null),
      getUserByEmail: () => Promise.resolve(null),
      getAllUsers: () => Promise.resolve([]),
      getAllRoles: () => Promise.resolve([]),
      validateUserData: () => [],
      isValidEmail: () => false
    };
  }

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    hasRole,
    isAdmin,
    isPartner,
    isBuyer,
    getUserById,
    getUserByEmail,
    getAllUsers,
    getAllRoles,
    validateUserData,
    isValidEmail
  };
}; 