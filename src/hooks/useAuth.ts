import { useEffect, useState } from 'react';

interface User {
  username: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData?: User) => void;
  logout: () => void;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData?: User) => {
    const defaultUser: User = {
      username: 'admin',
      name: 'Administrator',
      email: 'admin@example.com'
    };
    
    const userToStore = userData || defaultUser;
    setUser(userToStore);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userToStore));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  };

  return {
    user,
    isLoggedIn,
    login,
    logout
  };
}; 