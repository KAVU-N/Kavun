import { NextResponse } from 'next/server';
import { EVENT_ADMIN_COOKIE_NAME } from '@/lib/eventAdminAuth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: EVENT_ADMIN_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}
