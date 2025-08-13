import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: User | null;
  authToken: string | null;
  isLoading: boolean; // Add loading state
  login: (user: User, token: string) => void;
  logout: () => void;
  updateAuthState: () => void;
  refreshTrigger: number; // Add this to force re-renders
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

  const updateAuthState = () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthToken(token);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setRefreshTrigger(prev => prev + 1); // Trigger refresh
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      logout();
    }
    setIsLoading(false); // Mark auth state as loaded
  };

  const login = (user: User, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setAuthToken(token);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setAuthToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  // Listen for storage changes (cross-tab authentication)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser' || e.key === 'authToken') {
        updateAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initial auth state check
    updateAuthState();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Check for auth changes every second (same-tab authentication)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('currentUser');
      
      const shouldBeLoggedIn = !!(token && userStr);
      if (shouldBeLoggedIn !== isLoggedIn) {
        updateAuthState();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const value: AuthContextType = {
    isLoggedIn,
    currentUser,
    authToken,
    isLoading,
    login,
    logout,
    updateAuthState,
    refreshTrigger
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
