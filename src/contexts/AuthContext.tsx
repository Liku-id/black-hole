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
import { AuthState, LoginRequest, User } from '@/types/auth';

import { useToast } from './ToastContext';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | {
      type: 'LOGIN_SUCCESS';
      payload: { user: User; accessToken: string; refreshToken: string };
    }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'LOGOUT_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | {
      type: 'RESTORE_SESSION';
      payload: { user: User; accessToken: string; refreshToken: string };
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
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
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
  const { showError } = useToast();

  // Restore session on app start
  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        const storedAccessToken = localStorage.getItem('auth_access_token');
        const storedRefreshToken = localStorage.getItem('auth_refresh_token');

        if (storedUser && storedAccessToken && storedRefreshToken) {
          const user = JSON.parse(storedUser);
          dispatch({
            type: 'RESTORE_SESSION',
            payload: {
              user,
              accessToken: storedAccessToken,
              refreshToken: storedRefreshToken
            }
          });
        } else {
          // No valid session found, mark as not authenticated
          dispatch({ type: 'SESSION_RESTORED' });
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Clear invalid stored data
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_access_token');
        localStorage.removeItem('auth_refresh_token');
        // Mark session restoration as complete with no authentication
        dispatch({ type: 'SESSION_RESTORED' });
      }
    };

    restoreSession();
  }, []);

  const login = async (data: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });
    setError(null);

    try {
      const response = await authService.login(data);

      const { user, accessToken, refreshToken } = response.body;

      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_access_token', accessToken);
      localStorage.setItem('auth_refresh_token', refreshToken);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, accessToken, refreshToken }
      });

      // Redirect to intended route or dashboard
      const redirectTo = (router.query.redirect as string) || '/dashboard';
      router.replace(redirectTo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      showError(errorMessage);
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      throw err;
    }
  };

  const logout = async () => {
    dispatch({ type: 'LOGOUT_START' });
    setError(null);

    try {
      if (state.user) {
        await authService.logout({ userId: state.user.id });
      }
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with logout even if API call fails
    } finally {
      // Clear localStorage
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_access_token');
      localStorage.removeItem('auth_refresh_token');

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
