'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'instructor';
  university: string;
  isVerified: boolean;
  expertise?: string; // Okuduğu bölüm
  grade?: number; // Kaçıncı sınıf
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'instructor';
  university: string;
  expertise?: string; // Okuduğu bölüm
  grade?: number; // Kaçıncı sınıf
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Mark component as mounted (client-side only)
    setMounted(true);

    // Only run on client-side
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // If on server-side, just set loading to false
      setLoading(false);
    }
  }, []);

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Kullanıcı kayıtlı ama email doğrulanmamış
      if (response.status === 403 && result.needsVerification) {
        setError('Lütfen önce email adresinizi doğrulayın');
        // Doğrulama sayfasına yönlendir
        router.push(`/auth/verify?email=${encodeURIComponent(result.email)}`);
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Giriş yapılırken bir hata oluştu');
      }

      setUser(result.user);
      
      // Only access localStorage on client-side
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
      }

      // Redirect student users to instructors page, others to home page
      if (result.user.role === 'student') {
        router.push('/egitmenler');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kayıt olurken bir hata oluştu');
      }

      // API yanıtını kontrol et - user nesnesi farklı yerlerde olabilir
      let userData = null;
      
      // 1. result.user içinde olabilir
      if (result.user) {
        userData = result.user;
        console.log("API yanıtı result.user içinde bulundu:", userData);
      } 
      // 2. Doğrudan result içinde olabilir (id, name, email gibi alanlar varsa)
      else if (result.id || result._id || result.name || result.email) {
        userData = result;
        console.log("API yanıtı doğrudan result içinde bulundu:", userData);
      }
      // 3. Hiçbir kullanıcı verisi yoksa, kayıt verilerinden oluştur
      else {
        console.log("API yanıtında kullanıcı verisi bulunamadı, geçici kullanıcı oluşturuluyor");
        // Geçici bir ID oluştur
        const tempId = Math.random().toString(36).substring(2, 15);
        userData = {
          id: tempId,
          name: data.name,
          email: data.email,
          role: data.role,
          university: data.university,
          isVerified: false
        };
      }

      // Kullanıcının seçtiği rolü logla
      console.log("Kullanıcının kayıt formunda seçtiği rol:", data.role);
      console.log("API yanıtında gelen rol (varsa):", userData.role);

      // API'den gelen kullanıcı nesnesini doğrula ve gerekirse varsayılan değerler ata
      const validatedUser: User = {
        id: userData.id || userData._id || '',
        name: userData.name || data.name || '',
        email: userData.email || data.email || '',
        // Öncelikle kullanıcının kayıt formunda seçtiği rolü kullan
        role: data.role || userData.role || 'student',
        university: userData.university || data.university || '',
        isVerified: userData.isVerified || false,
        expertise: userData.expertise
      };

      console.log("Doğrulanmış kullanıcı verisi:", validatedUser);
      
      // Kullanıcı doğrulama sayfasına yönlendir
      router.push(`/auth/verify?email=${encodeURIComponent(validatedUser.email)}`);
      
      // Kullanıcı bilgilerini ve token'ı kaydetmiyoruz - doğrulama sonrası yapılacak
    } catch (err: any) {
      console.error("Kayıt hatası:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Çıkış yapılırken bir hata oluştu');
      }

      setUser(null);
      
      // Only access localStorage on client-side
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }

      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // If not mounted yet (server-side), provide a minimal version
  if (!mounted) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          loading: true,
          error: null,
          login: async () => {},
          register: async () => {},
          logout: async () => {},
          setUser: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
