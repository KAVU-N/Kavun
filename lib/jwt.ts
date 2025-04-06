import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name?: string;
  university?: string;
}

// Token oluştur
export function generateToken(payload: Partial<DecodedToken>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Token doğrula
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
    throw new Error('Geçersiz token');
  }
} 