export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}

export async function POST(req: Request) {
  console.log('[DEBUG][LOGIN] Endpoint çağrıldı (console.log)');
  console.error('[ERROR][LOGIN] Endpoint çağrıldı (console.error)');
  try {
    // Request body'i parse et
    const { email, password } = await req.json();

    // Validasyon
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre zorunludur' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // MongoDB bağlantısı
    await connectDB();

    // Debug için
    console.log('Login attempt for email:', email);

    // Email doğrulaması kontrolü
    const user = await User.findOne({ email }).select('+password') as IUser | null;
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    // Debug için
    console.log('Found user:', {
      id: user._id ? user._id.toString() : '',
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.university,
      isVerified: user.isVerified
    });

    // Email doğrulaması kontrolü
    if (!user.isVerified) {
      // Doğrulama kodu oluştur ve gönder
      const { generateVerificationCode, sendVerificationEmail } = await import('@/lib/mail');
      const verificationCode = generateVerificationCode();
      const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika
      
      // Kullanıcı bilgilerini güncelle
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;
      await user.save();
      
      try {
        await sendVerificationEmail(user.email, verificationCode);
        
        return NextResponse.json(
          { 
            error: 'Lütfen önce email adresinizi doğrulayın',
            needsVerification: true,
            email: user.email
          },
          { 
            status: 403,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      } catch (emailError) {
        console.error('Doğrulama e-postası gönderme hatası:', emailError);
        return NextResponse.json(
          { error: 'Doğrulama e-postası gönderilirken bir hata oluştu' },
          { 
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': 'true'
            }
          }
        );
      }
    }


    // JWT token oluştur
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    console.log('[DEBUG][LOGIN] JWT_SECRET env (ilk 10 karakter):', jwtSecret.substring(0, 10), 'uzunluk:', jwtSecret.length);
    const token = jwt.sign(
      { 
        id: user._id ? user._id.toString() : '', 
        email: user.email,
        role: user.role,
        name: user.name 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
    console.log('[DEBUG][LOGIN] Üretilen token (ilk 10 karakter):', token.substring(0, 10), 'uzunluk:', token.length);
    console.error('[ERROR][LOGIN] Üretilen token (ilk 10 karakter):', token.substring(0, 10), 'uzunluk:', token.length);

    // Debug için
    console.log('Login successful, returning user data:', {
      id: user._id ? user._id.toString() : '',
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.university,
      expertise: user.expertise,
      grade: user.grade,
      isVerified: user.isVerified
    });

    // Password alanını response'dan çıkar
    const userWithoutPassword = {
      id: user._id ? user._id.toString() : '',
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.university,
      expertise: user.expertise,
      grade: user.grade,
      isVerified: user.isVerified,
      profilePhotoUrl: user.profilePhotoUrl
    };

    // Kullanıcı bilgilerini döndür
    return NextResponse.json(
      {
        user: userWithoutPassword,
        token
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
}