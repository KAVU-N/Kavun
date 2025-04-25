import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { image, userId } = await req.json();

    // base64'ten dosya kaydet
    if (!image || !userId) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }

    // base64 header'ı ayıkla
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Geçersiz resim formatı' }, { status: 400 });
    }
    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `profile-${userId}-${Date.now()}.png`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);

    // uploads klasörü yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${fileName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Profil fotoğrafı yükleme hatası:', error);
    return NextResponse.json({ error: 'Fotoğraf yüklenemedi' }, { status: 500 });
  }
}
