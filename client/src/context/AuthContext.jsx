import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (email, password) => {
    const data = await authApi.register(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const loginWithGoogle = async (credential) => {
    const data = await authApi.googleLogin(credential);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, register, login, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
