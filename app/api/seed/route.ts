import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Project from '@/models/Project';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    // Örnek kurslar
    await Course.create([
      { 
        title: 'Web Geliştirme Temelleri',
        description: 'HTML, CSS ve JavaScript ile modern web geliştirmenin temellerini öğrenin. Sıfırdan başlayarak profesyonel web siteleri oluşturmayı öğreneceksiniz.',
        imageUrl: '/courses/web-development.jpg',
        instructor: 'Ahmet Yılmaz',
        duration: '8 saat 30 dakika',
        level: 'Başlangıç',
        topics: [
          'HTML5 Temelleri',
          'CSS3 ve Responsive Tasarım',
          'JavaScript ES6+',
          'DOM Manipülasyonu',
          'Web API\'leri'
        ],
        requirements: [
          'Temel bilgisayar kullanımı',
          'Metin editörü (VS Code önerilir)',
          'Modern bir web tarayıcısı'
        ],
        price: 199.99,
        isPublished: true,
        rating: {
          average: 4.7,
          count: 128
        },
        enrollmentCount: 350
      },
      { 
        title: 'React.js ile Modern Web Uygulamaları',
        description: 'React.js kullanarak modern ve interaktif web uygulamaları geliştirmeyi öğrenin. Hooks, Context API ve modern React pratiklerini uygulayarak öğreneceksiniz.',
        imageUrl: '/courses/react.jpg',
        instructor: 'Mehmet Demir',
        duration: '12 saat 45 dakika',
        level: 'Orta',
        topics: [
          'React Temelleri',
          'Hooks ve Custom Hooks',
          'Context API',
          'React Router',
          'State Management',
          'API Entegrasyonu'
        ],
        requirements: [
          'JavaScript temelleri',
          'ES6+ bilgisi',
          'NPM ve Node.js temel bilgisi'
        ],
        price: 299.99,
        isPublished: true,
        rating: {
          average: 4.9,
          count: 85
        },
        enrollmentCount: 220
      }
    ]);

    // Örnek projeler
    const sampleProjects = [
      {
        title: 'E-Ticaret Platformu',
        description: 'Modern bir e-ticaret platformu',
        category: 'Web',
        imageUrl: '/images/projects/ecommerce.jpg',
        technologies: ['Next.js', 'MongoDB', 'Tailwind CSS'],
        status: 'Tamamlandı'
      },
      {
        title: 'Mobil Sağlık Uygulaması',
        description: 'Sağlık takibi için mobil uygulama',
        category: 'Mobil',
        imageUrl: '/images/projects/health-app.jpg',
        technologies: ['React Native', 'Firebase'],
        status: 'Devam Ediyor'
      },
      {
        title: 'Yapay Zeka Chatbot',
        description: 'Müşteri hizmetleri için AI chatbot',
        category: 'Yapay Zeka',
        imageUrl: '/images/projects/chatbot.jpg',
        technologies: ['Python', 'TensorFlow', 'NLP'],
        status: 'Planlanıyor'
      }
    ];

    // Mevcut projeleri temizle
    await Project.deleteMany({});

    // Yeni projeleri ekle
    await Project.insertMany(sampleProjects);

    // Örnek kullanıcı
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User'
    });

    return NextResponse.json({
      message: 'Örnek veriler başarıyla eklendi',
      count: sampleProjects.length
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error.message || 'Veri ekleme hatası' },
      { status: 500 }
    );
  }
} 