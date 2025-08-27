import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Auth kontrolü
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkilendirme başarısız' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    if (!decoded || !(decoded.userId || decoded.id)) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    const { image, userId } = await req.json();

    // base64'ten dosya kaydetme yerine Cloudinary'a yükleyeceğiz
    if (!image || !userId) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }

    // Token’daki userId ile body’deki userId eşleşmeli
    const userIdFromToken = decoded.userId || decoded.id;
    if (userIdFromToken !== userId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 403 });
    }

    // Env kontrolleri
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'kavunla/profile-photos';
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary yapılandırması eksik' }, { status: 500 });
    }

    // Cloudinary imzası oluştur
    const timestamp = Math.floor(Date.now() / 1000);
    // public_id vermezsek Cloudinary üretir; dosya adı benzersiz olması için userId ve timestamp ekleyebiliriz
    const publicId = `profile-${userId}-${timestamp}`;
    // İmza, parametrelerin alfabetik sırayla birleştirilmesi ve api_secret ile sha1 yapılması ile oluşur.
    // Kullanacağımız parametreler: folder, public_id, timestamp
    const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    // Cloudinary upload endpoint'i
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // FormData ile upload (file alanına data URI verilebilir)
    const form = new FormData();
    form.append('file', image); // data URI
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);
    form.append('public_id', publicId);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: form,
    });

    const json = await res.json();
    if (!res.ok) {
      console.error('Cloudinary upload error:', json);
      const msg = (json && (json.error?.message || json.message)) || 'Fotoğraf yüklenemedi';
      // Geliştirme ortamında hata mesajını daha açık döndür
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ error: `Cloudinary: ${msg}` }, { status: 500 });
      }
      return NextResponse.json({ error: 'Fotoğraf yüklenemedi' }, { status: 500 });
    }

    // secure_url global erişilebilir URL'dir
    const url = json.secure_url as string;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Profil fotoğrafı yükleme hatası:', error);
    return NextResponse.json({ error: 'Fotoğraf yüklenemedi' }, { status: 500 });
  }
}
