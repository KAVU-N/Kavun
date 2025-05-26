import jwt from 'jsonwebtoken';

// Tüm projede aynı JWT_SECRET kullanılmalı
const JWT_SECRET = process.env.JWT_SECRET || 'kavunla-secret-key-for-jwt-authentication';

export interface DecodedToken {
  id: string;
  userId?: string;
  email: string;
  role: string;
  name?: string;
  university?: string;
}

// Token oluştur
export function generateToken(payload: Partial<DecodedToken>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Token doğrula - sürüm 1 (mevcut)
export function verifyToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // userId, id veya _id hangisi varsa kullan
    return {
      ...decoded,
      id: decoded.userId || decoded.id || decoded._id || '',
      email: decoded.email || '',
      role: decoded.role || ''
    };
  } catch (error) {
    console.error('JWT doğrulama hatası:', error);
    throw new Error('Geçersiz token');
  }
}

// Token doğrula - sürüm 2 (eski API'ler için)
export async function verifyJwt(token: string): Promise<DecodedToken | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // userId, id veya _id hangisi varsa kullan
    return {
      ...decoded,
      id: decoded.userId || decoded.id || decoded._id || '',
      email: decoded.email || '',
      role: decoded.role || ''
    };
  } catch (error) {
    console.error('JWT doğrulama hatası:', error);
    return null;
  }
}

// Request'ten token çıkar
export function extractTokenFromRequest(request: Request): string | null {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    return token || null;
  } catch (error) {
    console.error('Token çıkarma hatası:', error);
    return null;
  }
}