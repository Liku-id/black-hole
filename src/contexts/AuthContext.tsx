import { useRouter } from 'next/router';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState
} from 'react';

import { authService } from '@/services';
import {
  AuthState,
  AuthUser,
  LoginRequest,
  UserRole,
  ALLOWED_ROLES
} from '@/types/auth';
import { apiUtils } from '@/utils/apiUtils';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | {
      type: 'LOGIN_SUCCESS';
      payload: { user: AuthUser };
    }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | {
      type: 'RESTORE_SESSION';
      payload: { user: AuthUser };
    }
  | { type: 'SESSION_RESTORED' };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true, // Start with loading = true
  isAuthenticated: false
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'LOGOUT_START':
      return { ...state, isLoading: true };

    case 'LOGIN_SUCCESS':
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        accessToken: null, // No longer stored on client
        refreshToken: null, // No longer stored on client
        isAuthenticated: true,
        isLoading: false
      };

    case 'LOGIN_ERROR':
    case 'LOGOUT_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null
      };

    case 'LOGOUT_SUCCESS':
      return {
        ...initialState,
        isLoading: false
      };

    case 'CLEAR_ERROR':
      return state;

    case 'SESSION_RESTORED':
      return {
        ...state,
        isLoading: false
      };

    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Restore session on app start by checking server-side session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // First check if session exists
        const sessionResponse = await apiUtils.get('/api/auth/session');

        if (sessionResponse.isAuthenticated && sessionResponse.user) {
          // Check if user role is allowed
          const userRole = sessionResponse.user.role;
          if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
            // Clear session for unauthorized role
            await apiUtils.post('/api/auth/clear-session');
            dispatch({ type: 'SESSION_RESTORED' });
            return;
          }

          // Session exists and we have user data with role information
          try {
            let userData;

            // Check if user is event organizer PIC from session data
            if (sessionResponse.user.role === UserRole.EVENT_ORGANIZER_PIC) {
              // Get event organizer specific data
              try {
                const organizerResponse =
                  await authService.getEventOrganizerMe();
                if (
                  organizerResponse.statusCode === 0 &&
                  organizerResponse.body
                ) {
                  userData = organizerResponse.body;
                } else {
                  throw new Error('Failed to get event organizer data');
                }
              } catch (error) {
                console.error(
                  'Failed to fetch event organizer data during session restore, falling back to regular user data:',
                  error
                );
                // Fallback to regular user data
                const meResponse = await authService.getMe();
                if (meResponse.statusCode === 0 && meResponse.body) {
                  userData = meResponse.body;
                } else {
                  throw new Error('Failed to get user data');
                }
              }
            } else {
              // Get regular user data
              const meResponse = await authService.getMe();
              if (meResponse.statusCode === 0 && meResponse.body) {
                userData = meResponse.body;
              } else {
                throw new Error('Failed to get user data');
              }
            }

            dispatch({
              type: 'RESTORE_SESSION',
              payload: {
                user: userData
              }
            });
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            dispatch({ type: 'SESSION_RESTORED' });
          }
        } else {
          // No valid session found, mark as not authenticated
          dispatch({ type: 'SESSION_RESTORED' });
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Mark session restoration as complete with no authentication
        dispatch({ type: 'SESSION_RESTORED' });
      }
    };

    restoreSession();
  }, []);

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      // First check if session exists
      const sessionResponse = await apiUtils.get('/api/auth/session');

      if (sessionResponse.isAuthenticated && sessionResponse.user) {
        // Check if user role is allowed
        const userRole = sessionResponse.user.role;
        if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
          // Clear session for unauthorized role
          await apiUtils.post('/api/auth/clear-session');
          dispatch({ type: 'SESSION_RESTORED' });
          return;
        }

        // Session exists and we have user data with role information
        try {
          let userData;

          // Check if user is event organizer PIC from session data
          if (sessionResponse.user.role === UserRole.EVENT_ORGANIZER_PIC) {
            // Get event organizer specific data
            try {
              const organizerResponse = await authService.getEventOrganizerMe();
              if (
                organizerResponse.statusCode === 0 &&
                organizerResponse.body
              ) {
                userData = organizerResponse.body;
              } else {
                throw new Error('Failed to get event organizer data');
              }
            } catch (error) {
              console.error(
                'Failed to fetch event organizer data during refresh, falling back to regular user data:',
                error
              );
              // Fallback to regular user data
              const meResponse = await authService.getMe();
              if (meResponse.statusCode === 0 && meResponse.body) {
                userData = meResponse.body;
              } else {
                throw new Error('Failed to get user data');
              }
            }
          } else {
            // Get regular user data
            const meResponse = await authService.getMe();
            if (meResponse.statusCode === 0 && meResponse.body) {
              userData = meResponse.body;
            } else {
              throw new Error('Failed to get user data');
            }
          }

          dispatch({
            type: 'RESTORE_SESSION',
            payload: {
              user: userData
            }
          });
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          dispatch({ type: 'SESSION_RESTORED' });
        }
      } else {
        // No valid session found, mark as not authenticated
        dispatch({ type: 'SESSION_RESTORED' });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Mark session restoration as complete with no authentication
      dispatch({ type: 'SESSION_RESTORED' });
    }
  };

  const login = async (data: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });
    setError(null);

    try {
      // First login to establish session and get user role
      const loginResponse = await authService.login(data);

      // Check user role from login response to determine which /me endpoint to call
      if (loginResponse && loginResponse.body && loginResponse.body.user) {
        let userData;

        // Check if user is event organizer PIC
        if (loginResponse.body.user.role === UserRole.EVENT_ORGANIZER_PIC) {
          // Get event organizer specific data
          try {
            const organizerResponse = await authService.getEventOrganizerMe();
            if (organizerResponse.statusCode === 0 && organizerResponse.body) {
              userData = organizerResponse.body;
            } else {
              throw new Error('Failed to get event organizer data');
            }
          } catch (error) {
            console.error(
              'Failed to fetch event organizer data, falling back to regular user data:',
              error
            );
            // Fallback to regular user data
            const meResponse = await authService.getMe();
            if (meResponse.statusCode === 0 && meResponse.body) {
              userData = meResponse.body;
            } else {
              throw new Error('Failed to get user data');
            }
          }
        } else {
          // Get regular user data
          const meResponse = await authService.getMe();
          if (meResponse.statusCode === 0 && meResponse.body) {
            userData = meResponse.body;
          } else {
            throw new Error('Failed to get user data');
          }
        }

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: userData }
        });

        // Redirect to intended route or dashboard
        const redirectTo = (router.query.redirect as string) || '/dashboard';
        router.replace(redirectTo);
      } else {
        throw new Error('Failed to authenticate user');
      }
    } catch (err) {
      let errorMessage = 'Login failed';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        // Handle API error responses
        const apiError = err as any;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.response?.data?.code === 'ROLE_NOT_ALLOWED') {
          errorMessage =
            'Access denied. Your role is not authorized to access this platform.';
        }
      }

      setError(errorMessage);
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
    }
  };

  const logout = async () => {
    dispatch({ type: 'LOGOUT_START' });
    setError(null);

    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with logout even if API call fails
    } finally {
      if (typeof window !== 'undefined') {
        try {
          const { mutate } = await import('swr');
          // Clear all SWR cache by invalidating all keys
          mutate(() => true, undefined, { revalidate: false });
        } catch (error) {
          console.error('Failed to clear SWR cache:', error);
        }
      }

      dispatch({ type: 'LOGOUT_SUCCESS' });
      router.replace('/login');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    refreshUserData,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
