"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/src/contexts/LanguageContext";

interface Project {
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
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { t } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Proje getirilemedi");
        const data = await res.json();
        setProject(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  if (loading) return <div className="pt-28 text-center">Yükleniyor...</div>;
  if (error) return <div className="pt-28 text-center text-red-600">{error}</div>;
  if (!project) return <div className="pt-28 text-center">Proje bulunamadı</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-28 pb-12">
      <h1 className="text-3xl font-bold text-[#994D1C] mb-4">{project.title}</h1>
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <p className="text-[#6B3416] whitespace-pre-line">{project.description}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-[#FF8B5E] text-white px-2 py-1 rounded-lg">{project.category}</span>
          {project.status && <span className="bg-[#FFE5D9] text-[#994D1C] px-2 py-1 rounded-lg">{project.status}</span>}
        </div>
        {project.technologies && project.technologies.length > 0 && (
          <div>
            <h2 className="font-semibold mb-1">Teknolojiler:</h2>
            <ul className="list-disc list-inside">
              {project.technologies.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className="font-semibold mb-1">İletişim:</h2>
          <p>{project.contact}</p>
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
  );
}
