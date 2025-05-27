import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';
import User from '@/models/User';
import fs from 'fs';
import { loadBannedWords, validateTextField } from '../auth/register/nameValidation';
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

    // Sadece ilgili sayfanın kaynaklarını aggregate pipeline ile getir
    const resources = await Resource.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ], { allowDiskUse: true });

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

// Gerçek NSFW kontrol fonksiyonu (dinamik require ile)
let nsfwModel: any = null;
async function checkNSFWImage(base64Data: string): Promise<boolean> {
  try {
    if (!base64Data) return false;
    // Dinamik require
    const nsfwjs = require('nsfwjs');
    const tf = require('@tensorflow/tfjs-node');
    // Sadece base64 kısmını al
    const base64 = base64Data.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    // Tensor oluştur
    let image = tf.node.decodeImage(buffer, 3);
    if (image.rank === 4) {
      image = image.squeeze(); // Tensor4D -> Tensor3D
    }
    // Modeli yükle (singleton)
    if (!nsfwModel) nsfwModel = await nsfwjs.load();
    const predictions = await nsfwModel.classify(image);
    image.dispose();
    // NSFW etiketi varsa uygunsuz kabul et
    const nsfwTags = ['Porn', 'Hentai', 'Sexy'];
    return predictions.some((pred: any) => nsfwTags.includes(pred.className) && pred.probability > 0.7);
  } catch (e) {
    console.error('NSFW kontrol hatası:', e);
    return false; // Hata olursa güvenli kabul et
  }
}


// Yeni kaynak ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

        // Gelişmiş güvenlik ve içerik kontrolü
    const bannedWords = loadBannedWords();
    const titleCheck = validateTextField(data.title, bannedWords, { minLen: 3, maxLen: 100 });
    if (!titleCheck.valid) {
      return NextResponse.json({ error: `Başlık hatası: ${titleCheck.error}` }, { status: 400 });
    }
    const descCheck = validateTextField(data.description, bannedWords, { minLen: 10, maxLen: 1000 });
    if (!descCheck.valid) {
      return NextResponse.json({ error: `Açıklama hatası: ${descCheck.error}` }, { status: 400 });
    }
    if (Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        const tagCheck = validateTextField(tag, bannedWords, { minLen: 2, maxLen: 40 });
        if (!tagCheck.valid) {
          return NextResponse.json({ error: `Etiket hatası: ${tagCheck.error}` }, { status: 400 });
        }
      }
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
          const pdfTextCheck = validateTextField(pdfData.text, bannedWords, { minLen: 10, maxLen: 10000 });
          if (!pdfTextCheck.valid) {
            return NextResponse.json({ error: `PDF dosya içeriği hatası: ${pdfTextCheck.error}` }, { status: 400 });
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
          const docxTextCheck = validateTextField(result.value, bannedWords, { minLen: 10, maxLen: 10000 });
          if (!docxTextCheck.valid) {
            return NextResponse.json({ error: `DOCX dosya içeriği hatası: ${docxTextCheck.error}` }, { status: 400 });
          }
        } catch (err) {
          console.error('DOCX dosyası okunurken hata:', err);
          return NextResponse.json({ error: 'DOCX dosyası okunamadı veya bozuk. Lütfen geçerli bir DOCX yükleyin.' }, { status: 400 });
        }
      }
            // PPT/PPTX
      else if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
        try {
                    // pptx-parse ile metin çıkarımı
          const base64 = data.fileData.split(',')[1];
          const buffer = Buffer.from(base64, 'base64');
          // pptx-parse sadece burada require edilir
          const pptxParse = require('pptx-parse');
          const pptxText = await pptxParse(buffer);
          if (pptxText && pptxText.text) {
            const pptxTextCheck = validateTextField(pptxText.text, bannedWords, { minLen: 10, maxLen: 10000 });
            if (!pptxTextCheck.valid) {
              return NextResponse.json({ error: `PPT/PPTX dosya içeriği hatası: ${pptxTextCheck.error}` }, { status: 400 });
            }
          }

        } catch (err) {
          console.error('PPT/PPTX dosyası okunurken hata:', err);
          return NextResponse.json({ error: 'PPT/PPTX dosyası okunamadı veya bozuk. Lütfen geçerli bir PPT/PPTX yükleyin.' }, { status: 400 });
        }
      }
      // PNG
      else if (fileName.endsWith('.png')) {
        // Basit +18/NSFW placeholder kontrolü (geliştirilebilir)
        const isNSFW = await checkNSFWImage(data.fileData);
        if (isNSFW) {
          return NextResponse.json({ error: 'Yüklenen görsel +18 veya uygunsuz içerik içeriyor.' }, { status: 400 });
        }
      }
    }

    // Gerekli alanları kontrol et
    if (!data.title || !data.description || !data.category || !data.format || !data.authorId) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    await connectDB();
    // Kullanıcıdan üniversite ve bölüm bilgisini çek
    let userDoc = null;
    if (data.authorId) {
      userDoc = await User.findById(data.authorId).lean();
    }
    // Kaynak oluştur
    const newResource = await Resource.create({
      title: data.title,
      description: data.description,
      author: data.author || '',
      category: data.category,
      format: data.format,
      // university ve department frontend'den alınmayacak, user profilinden çekilecek
      university: userDoc?.university || '',
      department: userDoc?.expertise || null,
      level: data.level || '',
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
    // Hata detayını logla ve response'a ekle
    let details = '';
    if (error instanceof Error) {
      details = error.stack || error.message;
    } else {
      details = String(error);
    }
    console.error('Kaynak oluşturulurken hata oluştu:', details);
    if (details.includes('ENOENT')) {
      return NextResponse.json(
        { error: 'Yüklenen dosya bulunamadı veya işlenemedi. Lütfen geçerli bir dosya yükleyin.', details },
        { status: 404 }
      );
    }
    // 400: Validation veya beklenen kullanıcı hataları için
    return NextResponse.json(
      { error: 'Kaynak oluşturulurken bir hata oluştu', details },
      { status: 400 }
    );
  }
}
