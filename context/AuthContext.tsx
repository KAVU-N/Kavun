'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User as BaseUser } from '../src/types/User';

type AuthUser = BaseUser & {
  _id?: string;
  isAdmin?: boolean;
  role?: string;
};

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    university: string,
    expertise: string,
    grade: number | undefined,
    recaptchaToken: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: AuthUser) => void;
  loading: boolean;
  authChecked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
    university: string,
    expertise: string,
    grade: number | undefined,
    recaptchaToken: string
  ) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, university, expertise, grade, recaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt olurken bir hata oluştu');
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Kayıt olurken bir hata oluştu');
    }
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız');
      }

      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser(data.user);
      router.push('/');
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      setUser(null);
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
