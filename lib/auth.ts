import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import User from '@/models/User';

// JWT_SECRET değişkenini doğru şekilde al
const JWT_SECRET = process.env.JWT_SECRET || 'kavunla-secret-key-for-jwt-authentication';

export interface UserJwtPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
}

// Token'dan kullanıcı bilgilerini çıkaran fonksiyon (hem Request/NextRequest hem string token destekler)
export async function getUserFromToken(requestOrToken: Request | { headers: { authorization?: string } } | string): Promise<UserJwtPayload | null> {
  try {
    let token = '';
    if (typeof requestOrToken === 'string') {
      // Direkt token geldi (pages/api)
      token = requestOrToken.replace('Bearer ', '');
    } else if ('headers' in requestOrToken && typeof requestOrToken.headers === 'object') {
      // Eğer headers bir Headers nesnesiyse (ör: new Headers())
      let authHeader: string | undefined;
      if (requestOrToken.headers instanceof Headers) {
        authHeader = requestOrToken.headers.get('authorization') || requestOrToken.headers.get('Authorization') || undefined;
      } else {
        // Normal obje ise (ör: { authorization: ... })
        authHeader = (requestOrToken.headers as any)['authorization'] || (requestOrToken.headers as any)['Authorization'];
      }
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Token bulunamadı veya geçersiz format');
        return null;
      }
      token = authHeader.split(' ')[1];
    } else if (requestOrToken instanceof Request) {
      // app router: Request
      const authHeader = requestOrToken.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Token bulunamadı veya geçersiz format');
        return null;
      }
      token = authHeader.split(' ')[1];
    }
    if (!token) {
      console.log('Token boş');
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
  role: string;
  name?: string;
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
    role: user.role,
    name: user.name
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
      role: userWithId.role,
      name: userWithId.name
    };
  } catch (error) {
    console.error('Kullanıcı doğrulama hatası:', error);
    throw error;
  }
}
 