import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Contact şeması
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model'i oluştur veya var olanı kullan
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validasyon
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur.' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz.' },
        { status: 400 }
      );
    }

    // Veritabanı bağlantısı
    await connectDB();

    // Yeni mesaj oluştur
    const contact = new Contact({
      name,
      email,
      subject,
      message,
    });

    // Mesajı kaydet
    await contact.save();

    return NextResponse.json(
      { message: 'Mesajınız başarıyla gönderildi.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('İletişim formu hatası:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
} 