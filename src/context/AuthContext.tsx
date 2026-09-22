'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LoginCredentials,
  RegisterClientDto,
  RegisterProviderDto,
  User,
} from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  registerClient: (data: RegisterClientDto) => Promise<User>;
  registerProvider: (data: RegisterProviderDto) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Cargar sesión inicial asíncronamente para evitar cascading renders
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const session = authService.getCurrentSession();
        if (isMounted && session.user && session.token) {
          setUser(session.user);
          setToken(session.token);
        }
      } catch (err) {
        console.error('Error recuperando sesión:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerClient = useCallback(async (data: RegisterClientDto): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.registerClient(data);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerProvider = useCallback(async (data: RegisterProviderDto): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.registerProvider(data);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerClient,
        registerProvider,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
