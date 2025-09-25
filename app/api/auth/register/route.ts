export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { loadBannedWords, isNameValid } from './nameValidation';
import bcrypt from 'bcryptjs';
import User, { IUser } from '@/models/User';
import connectDB from '@/lib/mongodb';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/mail';

const defaultHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true'
};

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      ...defaultHeaders,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      university,
      expertise = '',
      grade,
      recaptchaToken
    } = body;

    const bannedWords = loadBannedWords();
    const nameValidation = isNameValid(name, bannedWords);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error || 'Ad soyad geçersiz.' },
        { status: 400, headers: defaultHeaders }
      );
    }

    if (!name || !email || !password || !university) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400, headers: defaultHeaders }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı' },
        { status: 400, headers: defaultHeaders }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const userData: Partial<IUser> = {
      name,
      email,
      password: hashedPassword,
      university,
      expertise,
      grade,
      verificationCode,
      verificationCodeExpires,
      isVerified: false,
      isAdmin: false
    };

    let user: IUser;
    try {
      user = await User.create(userData) as IUser;
    } catch (error: any) {
      if (error?.code === 11000) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kayıtlı' },
          { status: 400, headers: defaultHeaders }
        );
      }
      throw error;
    }

    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (error) {
      console.error('Email gönderme hatası:', error);
    }

    return NextResponse.json(
      {
        message: 'Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.',
        redirectUrl: `/auth/verify?email=${encodeURIComponent(email)}`,
        email,
        recaptchaToken
      },
      { status: 201, headers: defaultHeaders }
    );
  } catch (error) {
    console.error('Register endpoint hata:', error);
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500, headers: defaultHeaders }
    );
  }
}
