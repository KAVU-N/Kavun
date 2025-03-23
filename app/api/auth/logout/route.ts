import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Başarıyla çıkış yapıldı' });
  
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
} 