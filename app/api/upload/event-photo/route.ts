import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Görsel verisi bulunamadı' }, { status: 400 });
    }

    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!uploadPreset || !cloudName) {
      return NextResponse.json({ error: 'Cloudinary yapılandırması eksik' }, { status: 500 });
    }

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: new URLSearchParams({
        file: image,
        upload_preset: uploadPreset,
        folder: 'kavunla/events',
      }),
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return NextResponse.json({ error: uploadData?.error?.message || 'Fotoğraf yüklenemedi' }, { status: 500 });
    }

    const url = typeof uploadData?.secure_url === 'string' ? uploadData.secure_url : undefined;

    if (!url) {
      return NextResponse.json({ error: 'Yükleme sonucu geçersiz' }, { status: 500 });
    }

    return NextResponse.json({ url }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fotoğraf yükleme hatası', details: error?.message }, { status: 500 });
  }
}
