'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import type { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher' | 'instructor',
    university: string,
    expertise?: string,
    grade?: number | string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  authChecked: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher' | 'instructor',
    university: string,
    expertise?: string,
    grade?: number | string
  ) => {},
  logout: () => {},
  updateUser: () => {},
  authChecked: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini al
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setAuthChecked(true);
    setLoading(false);
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
        // Eğer email doğrulanmamışsa, doğrulama sayfasına yönlendir
        if (error.needsVerification && error.email) {
          router.push(`/auth/verify?email=${encodeURIComponent(error.email)}`);
          return;
        }
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
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const domain = isHttps && !isLocalhost && hostname.endsWith('kavunla.com') ? '; domain=.kavunla.com' : '';
        document.cookie = `token=${data.token}; path=/; SameSite=${sameSite}${secure}${domain}`;
        localStorage.setItem('token', data.token);
        console.log('TOKEN (login sonrası):', data.token);
      }
      router.push('/kaynaklar');
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'teacher' | 'instructor',
    university: string,
    expertise?: string,
    grade?: number | string
  ) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, university, expertise, grade })
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
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const domain = isHttps && !isLocalhost && hostname.endsWith('kavunla.com') ? '; domain=.kavunla.com' : '';
        document.cookie = `token=${data.token}; path=/; SameSite=${sameSite}${secure}${domain}`;
        localStorage.setItem('token', data.token);
        console.log('TOKEN (register sonrası):', data.token);
      }
      router.push('/kaynaklar');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Çerezden token sil
    document.cookie = 'token=; path=/; Max-Age=0';
    router.push('/');
  };

  // Kullanıcı bilgisini güncelleyen fonksiyon
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}