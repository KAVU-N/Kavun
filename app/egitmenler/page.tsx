'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaChalkboardTeacher, FaGraduationCap, FaStar } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function InstructorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Eğer kullanıcı henüz yüklenmemişse veya giriş yapmamışsa yükleniyor göster
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFB996] to-[#FFECEC] flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg">
          <div className="w-12 h-12 border-4 border-[#FFB996] border-t-[#FF8B5E] rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-[#994D1C] mb-2">Yükleniyor...</h2>
          <p className="text-[#6B3416]">Giriş yapmanız gerekiyor.</p>
          <p className="text-[#6B3416] mt-2">Giriş sayfasına yönlendiriliyorsunuz.</p>
        </div>
      </div>
    );
  }

  const instructors = [
    {
      name: "Dr. Ahmet Yılmaz",
      title: "Yazılım Geliştirme Uzmanı",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      rating: 4.8,
      courses: 12,
      students: 2500,
      expertise: ["Python", "Machine Learning", "Web Development"]
    },
    {
      name: "Prof. Ayşe Demir",
      title: "Veri Bilimi Uzmanı",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      rating: 4.9,
      courses: 8,
      students: 1800,
      expertise: ["Data Science", "Deep Learning", "AI"]
    },
    {
      name: "Mehmet Kaya",
      title: "Frontend Geliştirici",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      rating: 4.7,
      courses: 15,
      students: 3200,
      expertise: ["React", "Vue.js", "UI/UX"]
    },
    {
      name: "Zeynep Arslan",
      title: "Backend Geliştirici",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      rating: 4.8,
      courses: 10,
      students: 2100,
      expertise: ["Node.js", "Django", "Database Design"]
    },
    {
      name: "Can Özkan",
      title: "Mobil Uygulama Geliştirici",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      rating: 4.6,
      courses: 6,
      students: 1500,
      expertise: ["React Native", "Flutter", "iOS Development"]
    },
    {
      name: "Elif Yıldız",
      title: "DevOps Mühendisi",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      rating: 4.9,
      courses: 7,
      students: 1900,
      expertise: ["Docker", "Kubernetes", "CI/CD"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFB996] to-[#FFECEC] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#994D1C] mb-4">
            Eğitmen Bul
          </h1>
          <p className="text-lg text-[#994D1C] max-w-2xl mx-auto">
            İhtiyacınıza uygun eğitmeni bulun ve hemen iletişime geçin.
            Deneyimli eğitmenlerimiz size yardımcı olmak için hazır.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Eğitmen veya ders ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#FFE5D9] rounded-lg outline-none transition-all duration-200
                focus:border-[#FFB996] focus:ring-2 focus:ring-[#FFB996]/20
                text-[#6B3416] placeholder-[#FFB996]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-[#FFB996]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'İngilizce'].map((subject) => (
            <button
              key={subject}
              className="px-4 py-2 bg-white border border-[#FFE5D9] rounded-full text-[#994D1C] 
                transition-all duration-200 hover:bg-[#FFE5D9] hover:text-[#6B3416]"
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="object-cover w-full h-48"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-[#994D1C] mb-2">
                  {instructor.name}
                </h2>
                <p className="text-[#6B3416] mb-4">{instructor.title}</p>
                
                <div className="flex items-center mb-4">
                  <FaStar className="text-[#FF8B5E] mr-1" />
                  <span className="text-[#6B3416]">{instructor.rating} (120+ değerlendirme)</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <FaChalkboardTeacher className="text-[#FF8B5E] mr-2" />
                    <span className="text-[#6B3416]">{instructor.courses} aktif kurs</span>
                  </div>
                  <div className="flex items-center">
                    <FaGraduationCap className="text-[#FF8B5E] mr-2" />
                    <span className="text-[#6B3416]">{instructor.students} öğrenci</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {instructor.expertise.map((exp, i) => (
                    <span
                      key={i}
                      className="inline-block bg-[#FFE5D9] text-[#994D1C] px-3 py-1 rounded-full text-sm mr-2 mb-2"
                    >
                      {exp}
                    </span>
                  ))}
                </div>

                <button className="w-full mt-6 bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-3 px-6 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300 shadow-md hover:shadow-lg">
                  Profili İncele
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
