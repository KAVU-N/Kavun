'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import type { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini al
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Giriş başarısız');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      // JWT token'ı çerez olarak kaydet
      if (data.token) {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const sameSite = isHttps && !isLocalhost ? 'None' : 'Strict';
        const secure = isHttps && !isLocalhost ? '; Secure' : '';
        const domain = isHttps && !isLocalhost ? '; domain=.kavunla.com' : '';
document.cookie = `token=${data.token}; path=/; SameSite=${sameSite}${secure}${domain}`;
        console.log('TOKEN (login sonrası, cookie):', document.cookie);
        console.log('TOKEN (login sonrası, value):', data.token);
      }
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kayıt başarısız');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      // JWT token'ı çerez olarak kaydet
      if (data.token) {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const sameSite = isHttps && !isLocalhost ? 'None' : 'Strict';
        const secure = isHttps && !isLocalhost ? '; Secure' : '';
        const domain = isHttps && !isLocalhost ? '; domain=.kavunla.com' : '';
document.cookie = `token=${data.token}; path=/; SameSite=${sameSite}${secure}${domain}`;
        console.log('TOKEN (register sonrası, cookie):', document.cookie);
        console.log('TOKEN (register sonrası, value):', data.token);
      }
      router.push('/');
    } catch (error) {
      throw error;
    }
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/');
  };

  // Kullanıcı bilgisini güncelleyen fonksiyon
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
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