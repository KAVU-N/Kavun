require('../../lib/mongooseAllowDiskUsePatch');
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';
import User from '@/models/User';
import fs from 'fs';

// Production ortamında test dosyasına erişimi engellemek için yardımcı fonksiyon
import path from 'path';

function readTestPdfIfDev() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // Proje kökünden mutlak yol oluştur
      const filePath = path.join(process.cwd(), 'test', 'data', '05-versions-space.pdf');
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      } else {
        console.warn(`Test PDF dosyası bulunamadı: ${filePath}`);
        return null;
      }
    } else {
      // Production'da dosya erişimi engelleniyor
      return null;
    }
  } catch (err) {
    console.error('Test PDF dosyası okunurken hata:', err);
    return null;
  }
}


export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // Filtre parametrelerini oku
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const format = searchParams.get('format') || '';
    const university = searchParams.get('university') || '';
    const academicLevel = searchParams.get('academicLevel') || '';
    // Pagination parametreleri
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const skip = (page - 1) * limit;

    // Sorgu oluştur
    let query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }
    if (category) query.category = category;
    if (format) query.format = format;
    if (university) query.university = university;
    if (academicLevel) query.academicLevel = academicLevel;

    // Toplam kaynak sayısı (filtreye göre)
    const totalCount = await Resource.countDocuments(query);

    // Sadece ilgili sayfanın kaynaklarını getir
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .allowDiskUse(true);

    return NextResponse.json({ resources, totalCount });
  } catch (error: unknown) {
    // Hata detaylarını daha kapsamlı logla
    let details = '';
    if (error instanceof Error) {
      details = error.stack || error.message;
      console.error('Kaynaklar getirilirken hata oluştu:', error.message, error.stack);
    } else {
      details = String(error);
      console.error('Kaynaklar getirilirken hata oluştu:', details);
    }
    // ENOENT gibi dosya bulunamadı hatalarını özel olarak yakala
    if (details.includes('ENOENT')) {
      return NextResponse.json(
        { error: 'Bir veya daha fazla dosya bulunamadı. Lütfen yöneticinizle iletişime geçin.', details },
        { status: 404 }
      );
    }
    // Diğer tüm beklenmeyen hatalar için
    return NextResponse.json(
      { error: 'Kaynaklar getirilirken bir hata oluştu', details },
      { status: 500 }
    );
  }
}

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Yeni kaynak ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Uygunsuz içerik anahtar kelimeleri
    const forbiddenWords = [
      // Türkçe küfür ve argo
      'amk', 'aq', 'orospu', 'sik', 'piç', 'yarrak', 'ananı', 'göt', 'mal', 'salak', 'aptal', 'gerizekalı',
      'ibne', 'ibine', 'pezevenk', 'kahpe', 'şerefsiz', 'yavşak', 'dallama', 'dingil', 'hıyar', 'kaltak',
      'puşt', 'kancık', 'dangalak', 'oç', 'amına', 'amcık', 'sürtük', 'bok', 'boktan', 'taşak', 'taşşağı',
      // İngilizce küfür ve argo
      'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'motherfucker', 'cunt', 'faggot',
      'slut', 'whore', 'cock', 'jerk', 'retard', 'nigger', 'nigga', 'wanker', 'twat', 'bollocks',
      // Irkçılık, nefret
      'hitler', 'nazi', 'jew', 'kike', 'israil düşmanı', 'antisemit', 'ırkçı', 'faşist', 'racist', 'hate',
      // Cinsel, pornografi
      'porn', 'porno', 'sex', 'seks', 'escort', 'fuhuş', 'fisting', 'anal', 'blowjob', 'handjob', 'sikiş',
      'gay', 'lezbiyen', 'trans', 'travesti', 'fetish', 'fetishist', 'incest', 'zoofili', 'pedofili',
      // Şiddet, tehdit
      'öldür', 'öldüreceğim', 'katil', 'bomb', 'bomba', 'intihar', 'suicide', 'terror', 'terör', 'terorist',
      'silah', 'gun', 'knife', 'stab', 'rape', 'tecavüz', 'saldırı', 'attack', 'lynch', 'linç',
      // Uyuşturucu, illegal
      'esrar', 'eroin', 'kokain', 'meth', 'methamphetamine', 'uyuşturucu', 'drug', 'drugs', 'weed', 'heroin',
      'cocaine', 'ecstasy', 'mdma', 'lsd', 'trip', 'marihuana', 'marijuana', 'skunk', 'bonzai',
      // Hack, scam, spam, illegal
      'hack', 'hacker', 'phishing', 'scam', 'spam', 'malware', 'virus', 'trojan', 'keylogger', 'carding',
      'crack', 'serial', 'warez', 'illegal', 'yasadışı', 'kaçak', 'darkweb', 'deepweb',
      // Diğer
      'yasaklı', 'ban', 'banlan', 'banlama', 'banlı', 'banlandın', 'banlayacağım', 'banlanacaksın',
      'banlanacak', 'banlanıyor', 'banlanmıştır', 'banlanmış', 'banlandı', 'banlanır',
    ];
    const containsForbidden = (text: string) => {
      const lower = text.toLocaleLowerCase('tr');
      return forbiddenWords.some(word => lower.includes(word));
    }

    // Başlık, açıklama, etiketlerde uygunsuz içerik kontrolü
    if (containsForbidden(data.title)) {
      return NextResponse.json({ error: 'Başlıkta uygunsuz içerik tespit edildi.' }, { status: 400 });
    }
    if (containsForbidden(data.description)) {
      return NextResponse.json({ error: 'Açıklamada uygunsuz içerik tespit edildi.' }, { status: 400 });
    }
    if (Array.isArray(data.tags) && containsForbidden(data.tags.join(','))) {
      return NextResponse.json({ error: 'Etiketlerde uygunsuz içerik tespit edildi.' }, { status: 400 });
    }

    // Dosya içeriği kontrolü (PDF/DOCX)
    if (data.fileData && data.fileName) {
      const fileName = data.fileName.toLowerCase();
      // PDF
      if (fileName.endsWith('.pdf')) {
        // data.fileData: "data:application/pdf;base64,..."
        try {
          const base64 = data.fileData.split(',')[1];
          const buffer = Buffer.from(base64, 'base64');
          const pdfData = await pdfParse(buffer);
          if (containsForbidden(pdfData.text)) {
            return NextResponse.json({ error: 'PDF dosya içeriğinde uygunsuz içerik bulundu.' }, { status: 400 });
          }
        } catch (err) {
          console.error('PDF dosyası okunurken hata:', err);
          return NextResponse.json({ error: 'PDF dosyası okunamadı veya bozuk. Lütfen geçerli bir PDF yükleyin.' }, { status: 400 });
        }
      }
      // DOCX
      else if (fileName.endsWith('.docx')) {
        try {
          const base64 = data.fileData.split(',')[1];
          const buffer = Buffer.from(base64, 'base64');
          const result = await mammoth.extractRawText({ buffer });
          if (containsForbidden(result.value)) {
            return NextResponse.json({ error: 'DOCX dosya içeriğinde uygunsuz içerik bulundu.' }, { status: 400 });
          }
        } catch (err) {
          console.error('DOCX dosyası okunurken hata:', err);
          return NextResponse.json({ error: 'DOCX dosyası okunamadı veya bozuk. Lütfen geçerli bir DOCX yükleyin.' }, { status: 400 });
        }
      }
      // Diğer dosya türleri için ek kontrol isterseniz eklenebilir.
    }

    // Gerekli alanları kontrol et
    if (!data.title || !data.description || !data.category || !data.format || !data.authorId) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    await connectDB();
    // Kaynak oluştur
    const newResource = await Resource.create({
      title: data.title,
      description: data.description,
      author: data.author || '',
      category: data.category,
      format: data.format,
      university: data.university || '',
      department: data.department || null,
      fileSize: data.fileSize || null,
      tags: data.tags || [],
      url: data.url || null,
      fileData: data.fileData || null,
      fileName: data.fileName || null,
      fileType: data.fileType || null,
      downloadCount: 0,
      viewCount: 0,
    });

    // Kullanıcının viewQuota'sını 3 artır
    if (data.authorId) {
      await User.findByIdAndUpdate(
        data.authorId,
        { $inc: { viewQuota: 3 } },
        { new: true }
      );
    }

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error('Kaynak oluşturulurken hata oluştu:', error);
    let details = '';
    if (error instanceof Error) {
      details = error.stack || error.message;
    } else {
      details = String(error);
    }
    if (details.includes('ENOENT')) {
      return NextResponse.json(
        { error: 'Yüklenen dosya bulunamadı veya işlenemedi. Lütfen geçerli bir dosya yükleyin.', details },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Kaynak oluşturulurken bir hata oluştu', details },
      { status: 500 }
    );
  }
}
