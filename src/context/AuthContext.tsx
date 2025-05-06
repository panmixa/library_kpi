import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { UserData } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const initAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const userData = authService.getUser();
        setUser(userData);
        if (userData?.id) {
          localStorage.setItem('user_id', userData.id);
        }
      }
    };

    initAuth();
  }, []);

  const login = (userData: UserData) => {
    setIsAuthenticated(true);
    setUser(userData);
    if (userData?.id) {
      localStorage.setItem('user_id', userData.id);
    }
  };

  const logout = () => {
    localStorage.removeItem('user_id');
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
