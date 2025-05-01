import { NextResponse } from 'next/server';

// Bu e-posta adresini kendi sisteminize göre değiştirin
const RECEIVER_EMAIL = 'video-gonderim@ornekmail.com';

export async function POST(req: Request) {
  try {
    const { lessonId, base64Video } = await req.json();
    if (!lessonId || !base64Video) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }

    // Mail gönderme işlemi (nodemailer veya başka bir servis ile)
    // NOT: Bu örnek kod, gerçek bir mail göndermez. Sunucu tarafında uygun bir mail servisiyle entegre edilmelidir.
    // Sadece loglama yapılır.
    console.log(`Ders ${lessonId} için mp4 video e-posta ile gönderilecek: ${RECEIVER_EMAIL}`);
    // Gerçek bir uygulamada burada base64Video'yu bir dosya olarak kaydedip, mail ile göndereceksiniz.

    // --- ÖRNEK: Mail gönderme işlemi (gerçek kodda nodemailer ile entegre edin) ---
    // await sendMail({
    //   to: RECEIVER_EMAIL,
    //   subject: `Ders Videosu - ${lessonId}`,
    //   text: 'Ders tamamlandı, video ektedir.',
    //   attachments: [{
    //     filename: `lesson-${lessonId}.mp4`,
    //     content: base64Video.split(',')[1],
    //     encoding: 'base64',
    //   }],
    // });
    // ---------------------------------------------------------------------------

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Video upload/send error:', err);
    return NextResponse.json({ error: 'Video yüklenirken bir hata oluştu' }, { status: 500 });
  }
}
