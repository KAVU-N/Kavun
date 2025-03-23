import mongoose from 'mongoose';
import Project from '../models/Project';
import * as dotenv from 'dotenv';

dotenv.config();

const projects = [
  {
    title: 'E-Ticaret Platformu',
    description: 'Modern bir e-ticaret platformu. Kullanıcılar ürünleri görüntüleyebilir, sepete ekleyebilir ve satın alabilirler.',
    category: 'Web Geliştirme',
    imageUrl: 'https://raw.githubusercontent.com/TahaArslan67/medcodes/main/public/images/projects/ecommerce.jpg',
    projectUrl: 'https://github.com/TahaArslan67/ecommerce',
    technologies: ['Next.js', 'MongoDB', 'Tailwind CSS'],
    status: 'Tamamlandı'
  },
  {
    title: 'Web Oyunu',
    description: 'JavaScript ile geliştirilmiş eğlenceli bir web oyunu. HTML5 Canvas kullanılarak oluşturulmuş.',
    category: 'Web Oyunu',
    imageUrl: 'https://raw.githubusercontent.com/TahaArslan67/medcodes/main/public/images/projects/game.jpg',
    projectUrl: 'https://github.com/TahaArslan67/web-game',
    technologies: ['JavaScript', 'HTML5 Canvas', 'CSS3'],
    status: 'Tamamlandı'
  },
  {
    title: 'Todo Uygulaması',
    description: 'React ve TypeScript ile geliştirilmiş modern bir todo uygulaması.',
    category: 'Web Geliştirme',
    imageUrl: 'https://raw.githubusercontent.com/TahaArslan67/medcodes/main/public/images/projects/todo.jpg',
    projectUrl: 'https://github.com/TahaArslan67/todo-app',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    status: 'Tamamlandı'
  }
];

async function seedProjects() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut projeleri temizle
    await Project.deleteMany({});
    console.log('Mevcut projeler temizlendi');

    // Yeni projeleri ekle
    const createdProjects = await Project.create(projects);
    console.log('Projeler başarıyla eklendi:', createdProjects);

    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

seedProjects();
