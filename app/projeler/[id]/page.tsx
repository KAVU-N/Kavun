"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/src/contexts/LanguageContext";
import ChatBox from "@/src/components/ChatBox";
import { useAuth } from "@/src/context/AuthContext";

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
  const categoryKey: Record<string,string> = {
    'Web':'category.web',
    'Mobil':'category.mobile',
    'Masaüstü':'category.desktop',
    'Yapay Zeka':'category.ai',
    'Genel':'category.general',
    'Diğer':'category.other'
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

  if (loading) return <div className="pt-28 text-center">Yükleniyor...</div>;
  if (error) return <div className="pt-28 text-center text-red-600">{error}</div>;
  if (!project) return <div className="pt-28 text-center">Proje bulunamadı</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-28 pb-12">
      <h1 className="text-3xl font-bold text-[#994D1C] mb-4">{project.title}</h1>
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <p className="text-[#6B3416] whitespace-pre-line leading-relaxed text-lg">{project.description}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-[#FF8B5E] text-white px-3 py-1 rounded-full text-xs font-medium">{t(categoryKey[project.category] ?? project.category)}</span>
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
              href={user ? `mailto:${project.contact}` : '#'}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  router.push('/auth/login');
                }
              }}
              className="inline-block mt-2 bg-[#994D1C] hover:bg-[#7e3f17] text-white font-semibold px-4 py-2 rounded transition"
             >
              İletişime Geç
            </a>
          )}
          {project.ownerId && (
            <button
              onClick={() => {
                if (!user) {
                  router.push('/auth/login');
                } else {
                  setActiveChat(true);
                }
              }}
              className="inline-block mt-2 ml-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
            >
              Site İçinden Mesaj Gönder
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
    {activeChat && instructor && (
      <ChatBox
        instructor={instructor}
        onClose={() => setActiveChat(false)}
      />
    )}
    </div>
  );
}
