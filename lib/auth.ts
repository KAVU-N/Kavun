import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import User from '@/models/User';

// JWT_SECRET değişkenini doğru şekilde al (login route ile aynı fallback)
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export interface UserJwtPayload {
  id: string;
  email: string;
  isAdmin: boolean;
  name?: string;
  role?: 'student' | 'teacher' | 'instructor' | 'admin';
}

// Token'dan kullanıcı bilgilerini çıkaran fonksiyon (hem Request/NextRequest hem string token destekler)
export async function getUserFromToken(requestOrToken: Request | { headers: { authorization?: string; cookie?: string } } | string): Promise<UserJwtPayload | null> {
  try {
    let token = '';
    if (typeof requestOrToken === 'string') {
      // Direkt token geldi (pages/api)
      token = requestOrToken.replace('Bearer ', '');
    } else if (requestOrToken instanceof Request || ('headers' in requestOrToken && typeof requestOrToken.headers === 'object')) {
      // Önce Authorization header'dan dene
      let authHeader: string | undefined;
      if (requestOrToken instanceof Request) {
        authHeader = requestOrToken.headers.get('authorization') || requestOrToken.headers.get('Authorization') || undefined;
      } else {
        const h = (requestOrToken as any).headers;
        if (h instanceof Headers) {
          authHeader = h.get('authorization') || h.get('Authorization') || undefined;
        } else {
          authHeader = h['authorization'] || h['Authorization'];
        }
      }
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
      // Authorization yoksa veya format yanlışsa cookie'den dene
      if (!token) {
        let cookieHeader = '';
        if (requestOrToken instanceof Request) {
          cookieHeader = requestOrToken.headers.get('cookie') || '';
        } else {
          const h = (requestOrToken as any).headers;
          if (h instanceof Headers) {
            cookieHeader = h.get('cookie') || '';
          } else {
            cookieHeader = h['cookie'] || '';
          }
        }
        const match = cookieHeader.match(/token=([^;]+)/);
        if (match) {
          token = match[1];
        }
      }
    }
    if (!token) {
      console.log('Token bulunamadı (header ve cookie).');
      return null;
    }
    // Token'ı doğrula ve payload'ı çıkar
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
      if (!decoded || !decoded.id) {
        console.log('Token doğrulanamadı veya ID bulunamadı');
        return null;
      }
      console.log('Token başarıyla doğrulandı, kullanıcı ID:', decoded.id);
      return decoded;
    } catch (jwtError) {
      console.error('JWT doğrulama hatası:', jwtError);
      return null;
    }
  } catch (error) {
    console.error('Token işleme hatası:', error);
    return null;
  }
}


// Kullanıcı tipi için arayüz tanımla
interface UserWithId {
  _id: { toString: () => string };
  email: string;
  isAdmin: boolean;
  name?: string;
  role?: 'student' | 'teacher' | 'instructor' | 'admin';
}

// Yeni token oluşturan fonksiyon
export function generateToken(user: UserWithId): string {
  // user._id'nin varlığını kontrol et
  if (!user._id) {
    throw new Error('Kullanıcı ID bulunamadı');
  }
  
  const payload: UserJwtPayload = {
    id: user._id.toString(),
    email: user.email,
    isAdmin: Boolean(user.isAdmin),
    name: user.name,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Kullanıcı kimliğini doğrulayan fonksiyon
export async function verifyUser(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    // TypeScript hatasını önlemek için user'i UserWithId olarak işaretle
    const userWithId = user as unknown as UserWithId;

    return {
      id: userWithId._id.toString(),
      email: userWithId.email,
      isAdmin: Boolean(userWithId.isAdmin),
      name: userWithId.name,
      role: userWithId.role,
    };
  } catch (error) {
    console.error('Kullanıcı doğrulama hatası:', error);
    throw error;
  }
}
 
