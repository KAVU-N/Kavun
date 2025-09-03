import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getUserFromToken } from '@/lib/auth';
import crypto from 'crypto';

export const runtime = 'nodejs';

function parseDataUrlInfo(dataUrl: string) {
  // data:[<mediatype>][;base64],<data>
  const match = /^data:(.+?);base64,(.*)$/.exec(dataUrl || '');
  if (!match) return { mime: '', size: 0 };
  const mime = match[1];
  const base64 = match[2];
  // base64 boyut hesaplama
  const padding = (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  const size = Math.floor(base64.length * 3 / 4) - padding; // byte
  return { mime, size };
}

export async function POST(req: Request) {
  try {
    // Auth kontrolü: Authorization veya Cookie üzerinden kabul et
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    let userIdFromToken = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = await verifyToken(token);
      if (!decoded || !(decoded.userId || decoded.id)) {
        return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
      }
      userIdFromToken = (decoded.userId || decoded.id) as string;
    } else {
      const me = await getUserFromToken(req);
      if (!me?.id) {
        return NextResponse.json({ error: 'Yetkilendirme başarısız' }, { status: 401 });
      }
      userIdFromToken = me.id;
    }

    const { image, userId, purpose } = await req.json();

    if (!image || !userId) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }

    // Token’daki userId ile body’deki userId eşleşmeli
    if (userIdFromToken !== userId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 403 });
    }

    // Env kontrolleri
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary yapılandırması eksik' }, { status: 500 });
    }

    // Amaç bazlı ayarlar
    const isClubLogo = purpose === 'club-logo';
    const defaultFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'kavunla/profile-photos';
    const folder = isClubLogo ? 'kavunla/club-logos' : defaultFolder;

    // MIME ve boyut doğrulaması (özellikle club-logo için 1MB sınır)
    const { mime, size } = parseDataUrlInfo(image);
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(mime)) {
      return NextResponse.json({ error: 'Yalnızca JPG, PNG veya WebP görseller yüklenebilir.' }, { status: 400 });
    }
    if (isClubLogo && size > 1 * 1024 * 1024) {
      return NextResponse.json({ error: 'Kulüp logosu 1MB altında olmalıdır.' }, { status: 400 });
    }

    // Cloudinary imzası oluştur
    const timestamp = Math.floor(Date.now() / 1000);
    const prefix = isClubLogo ? 'club-logo' : 'profile';
    const publicId = `${prefix}-${userId}-${timestamp}`;
    const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

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
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ error: `Cloudinary: ${msg}` }, { status: 500 });
      }
      return NextResponse.json({ error: 'Fotoğraf yüklenemedi' }, { status: 500 });
    }

    // secure_url global erişilebilir URL'dir
    const url = json.secure_url as string;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Profil/Logo fotoğrafı yükleme hatası:', error);
    return NextResponse.json({ error: 'Fotoğraf yüklenemedi' }, { status: 500 });
  }
}
