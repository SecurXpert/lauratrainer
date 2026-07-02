 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
 
interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
  // Add more when needed: user, token, refreshUserProfile, etc.
}
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
 
  // Check token on mount + whenever it changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token); // simple version — you can later validate JWT
    };
 
    checkAuth();
 
    // Listen for storage changes (useful in multi-tab scenarios)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
 
  const logout = () => {
    localStorage.removeItem('access_token');
    // localStorage.removeItem('instructor_user'); // if you still use it somewhere
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };
 
  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
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
 