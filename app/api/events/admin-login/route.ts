import { NextResponse } from 'next/server';
import {
  EVENT_ADMIN_COOKIE_NAME,
  EVENT_ADMIN_COOKIE_VALUE,
  isValidEventAdminCredentials,
} from '@/lib/eventAdminAuth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!isValidEventAdminCredentials(email, password)) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: EVENT_ADMIN_COOKIE_NAME,
      value: EVENT_ADMIN_COOKIE_VALUE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 12, // 12 saat
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası', details: error?.message }, { status: 500 });
  }
}
