"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/src/contexts/LanguageContext";
import dynamic from "next/dynamic";
import { useAuth } from "@/src/context/AuthContext";

const ChatBox = dynamic(() => import("@/src/components/ChatBox"), { ssr: false });

interface Project {
  position?: string;
  requirements?: string;
  benefits?: string;
  projectUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  _id: string;
  title: string;
  description: string;
  category: string;
  linkedinUrl: string;
  contact: string;
  technologies?: string[];
  status?: string;
  createdAt: string;
  ownerId?: string;
}

export default function ProjectDetailPage() {
  const categoryValueMap: Record<string, string[]> = {
    'category.general': ['category.general', 'Genel', 'General'],
    'category.web': ['category.web', 'Web'],
    'category.mobile': ['category.mobile', 'Mobil', 'Mobile'],
    'category.desktop': ['category.desktop', 'Masaüstü', 'Desktop'],
    'category.ai': ['category.ai', 'Yapay Zeka', 'Artificial Intelligence'],
    'category.game': ['category.game', 'Oyun', 'Game'],
    'category.dataScience': ['category.dataScience', 'Veri Bilimi', 'Data Science'],
    'category.cyberSecurity': ['category.cyberSecurity', 'Siber Güvenlik', 'Cyber Security'],
    'category.blockchain': ['category.blockchain', 'Blockchain'],
    'category.iot': ['category.iot', 'IoT'],
    'category.arvr': ['category.arvr', 'AR/VR'],
    'category.robotics': ['category.robotics', 'Robotik', 'Robotics'],
    'category.ecommerce': ['category.ecommerce', 'E-Ticaret', 'E-Commerce'],
    'category.fintech': ['category.fintech', 'FinTech'],
    'category.health': ['category.health', 'Sağlık', 'Health'],
    'category.education': ['category.education', 'Eğitim', 'Education'],
    'category.cloud': ['category.cloud', 'Cloud'],
    'category.devops': ['category.devops', 'DevOps'],
    'category.dataEngineering': ['category.dataEngineering', 'Data Engineering'],
    'category.hardware': ['category.hardware', 'Donanım', 'Hardware'],
    'category.other': ['category.other', 'Diğer', 'Other'],
  };

  const mapCategoryToKey = (value: string) => {
    if (!value) return value;
    const normalized = value.toLowerCase();
    for (const [key, labels] of Object.entries(categoryValueMap)) {
      if (labels.some((label) => label.toLowerCase() === normalized)) {
        return key;
      }
    }
    return value;
  };
  const statusKey: Record<string,string> = {
    'Devam Ediyor':'status.ongoing',
    'Tamamlandı':'status.completed',
    'Planlanıyor':'status.planned'
  };
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const isLoggedIn = !!user;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);
  const [activeChat, setActiveChat] = useState(false);
  const [instructor, setInstructor] = useState<{ _id: string; name: string; email: string; university: string; role: string } | null>(null);

  useEffect(() => {
    if (!id || fetchedRef.current) return;
    fetchedRef.current = true;
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Proje getirilemedi");
        const data = await res.json();
        setProject(data);
        // Proje sahibinin bilgilerini getir
        if (data.ownerId) {
          try {
            const userRes = await fetch(`/api/users/public/${data.ownerId}`);
            if (userRes.ok) {
              const userData = await userRes.json();
              setInstructor({
                _id: userData.id || userData._id || data.ownerId,
                name: userData.name,
                email: userData.email,
                university: userData.university,
                role: userData.role
              });
            }
          } catch (e) {
            console.error("Kullanıcı bilgisi alınamadı", e);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="pt-28 text-center">{t('general.loading')}</div>;
  if (error) return <div className="pt-28 text-center text-red-600">{error}</div>;
  if (!project) return <div className="pt-28 text-center">{t('project.notFound')}</div>;

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Kart ve buton: buton kartın DIŞINDA, hemen solunda */}
        <div className="relative">
          {/* Geri butonu (kartın dışında, solunda) */}
          <button
            onClick={() => router.back()}
            aria-label="Geri Dön"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#994D1C]/30 text-[#994D1C] bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md hover:border-[#6B3416]/40 transition-all duration-300 absolute top-0 -left-3 -translate-x-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Geri Dön</span>
          </button>
          {/* İçerik kartı */}
          <div className="relative bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h1 className="text-3xl font-bold text-[#994D1C] -mt-2">{project.title}</h1>
            <p className="text-[#6B3416] whitespace-pre-line leading-relaxed text-lg">{project.description}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-[#FF8B5E] text-white px-3 py-1 rounded-full text-xs font-medium">{t(mapCategoryToKey(project.category))}</span>
              {project.status && <span className="bg-[#FFE5D9] text-[#994D1C] px-3 py-1 rounded-full text-xs font-medium">{t(statusKey[project.status] ?? project.status)}</span>}
            </div>
            {project.requirements && (
              <div>
                <h2 className="font-semibold mb-2 text-[#994D1C]">{t('project.requirements')}</h2>
                <p className="whitespace-pre-line">{project.requirements}</p>
              </div>
            )}
            {project.position && (
              <p><span className="font-semibold">{t('project.position')}: </span>{project.position}</p>
            )}
            {project.benefits && (
              <div>
                <h2 className="font-semibold mb-2 text-[#994D1C]">{t('project.benefits')}</h2>
                <p className="whitespace-pre-line">{project.benefits}</p>
              </div>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2 text-[#994D1C]">{t('project.technologies')}</h2>
                <ul className="list-disc list-inside">
                  {project.technologies.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h2 className="font-semibold mb-2 text-[#994D1C]">{t('project.contact')}</h2>
              <p>{project.contact}</p>
              {project.contact?.includes('@') && (
                <a 
                  href={isLoggedIn ? `mailto:${project.contact}` : '#'}
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      router.push('/auth/login');
                    }
                  }}
                  className="inline-block mt-2 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] text-white font-semibold px-4 py-2 rounded-lg hover:shadow-md hover:shadow-[#60A5FA]/20 transition-all duration-300"
                >
                  {t('general.sendEmail')}
                </a>
              )}
              {project.ownerId && (
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      router.push('/auth/login');
                    } else {
                      setActiveChat(true);
                    }
                  }}
                  className="inline-block mt-2 ml-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-semibold px-4 py-2 rounded-lg hover:shadow-md hover:shadow-[#FFB996]/20 transition-all duration-300"
                >
                  {t('general.sendMessage')}
                </button>
              )}
              {project.projectUrl && (
                <p><span className="font-semibold">{t('project.url')}: </span><Link href={project.projectUrl} target="_blank" className="text-blue-600 underline break-all">{project.projectUrl}</Link></p>
              )}
            </div>
            {project.linkedinUrl && (
              <div>
                <Link href={project.linkedinUrl} target="_blank" className="inline-block bg-[#FF8B5E] hover:bg-[#FFD7A8] text-white font-semibold px-4 py-2 rounded transition">
                  LinkedIn
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    {activeChat && instructor && (
      <ChatBox
        instructor={instructor}
        onClose={() => setActiveChat(false)}
      />
    )}
    </div>
  );
}
