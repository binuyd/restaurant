import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  logout: () => void;
  quickLogin: (role: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user_info');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('jwt_token');
  });

  const saveAuthSession = (authData: AuthResponse) => {
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem('jwt_token', authData.token);
    localStorage.setItem('user_info', JSON.stringify(authData.user));
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    saveAuthSession(res.data);
  };

  const register = async (name: string, email: string, password: string, role = 'CUSTOMER' as const) => {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password, role });
    saveAuthSession(res.data);
  };

  const quickLogin = async (role: 'CUSTOMER' | 'ADMIN') => {
    if (role === 'ADMIN') {
      await login('admin@gourmet.com', 'admin123');
    } else {
      await login('customer@gourmet.com', 'customer123');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        quickLogin,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
