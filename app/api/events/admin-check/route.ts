import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  EVENT_ADMIN_COOKIE_NAME,
  isValidEventAdminToken,
} from '@/lib/eventAdminAuth';

export async function GET() {
  const token = cookies().get(EVENT_ADMIN_COOKIE_NAME)?.value;

  if (!isValidEventAdminToken(token)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true }, { status: 200 });
}
