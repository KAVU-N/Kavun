'use client';
import { motion } from 'framer-motion';
import { FaCode, FaMobile, FaRobot, FaDatabase, FaCloud, FaLock, FaSpinner, FaStar } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const IconMap = {
  1: FaCode,
  2: FaMobile,
  3: FaRobot,
  4: FaDatabase,
  5: FaCloud,
  6: FaLock,
};

interface Course {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  level: string;
  duration: string;
  instructor: string;
  price: number;
  topics: string[];
  requirements: string[];
  isPublished: boolean;
  rating: {
    average: number;
    count: number;
  };
  enrollmentCount: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Kurslar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a1e]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaSpinner className="text-4xl text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1e] text-white pt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 z-0 pointer-events-none" />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative container mx-auto px-4 z-1">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
        >
          Eğitim Programlarımız
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => {
            const Icon = IconMap[((index % 6) + 1) as keyof typeof IconMap];
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative h-48 bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <Icon className="text-6xl text-white/90 transform group-hover:scale-110 transition-transform duration-300" />
                </div>

                <div className="relative p-6 space-y-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-white/90 group-hover:text-white transition-colors">
                      {course.title}
                    </h2>
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-white/80 text-sm">{course.rating.average.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-white/70 h-24 overflow-hidden">
                    {course.description}
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/60">Seviye: {course.level}</span>
                      <span className="text-white/60">Süre: {course.duration}</span>
                    </div>

                    <div className="text-sm">
                      <p className="text-white/60">Eğitmen: {course.instructor}</p>
                      <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {course.price} TL
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white/80">Konular:</p>
                      <div className="flex flex-wrap gap-2">
                        {course.topics.map((topic) => (
                          <span
                            key={topic}
                            className="px-3 py-1 text-xs bg-white/10 text-white/80 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 group-hover/btn:translate-x-full transition-transform duration-500" />
                      <span className="relative">Detayları Gör</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 