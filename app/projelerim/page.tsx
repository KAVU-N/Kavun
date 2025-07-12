"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function MyProjectsPage() {
  interface Project {
    _id: string;
    title: string;
    description: string;
    linkedinUrl: string;
    category: string;
    ownerId: string;
    position?: string;
  }

  const { t } = useLanguage();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteId,setDeleteId]=useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Projeler alınamadı");
        const data: Project[] = await res.json();
        setProjects(data.filter((p) => p.ownerId === user?._id));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const deleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-28 pb-12">
      <h1 className="text-3xl font-bold mb-6 text-[#994D1C]">{t("nav.myProjects")}</h1>
      {loading && <p>Yükleniyor...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {projects.length === 0 && !loading ? (
        <p className="text-gray-600 italic">Henüz projeniz yok. <Link href="/projeler/olustur" className="text-blue-600 underline">Yeni proje ekleyin</Link></p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex flex-col p-4">

              <h2 className="font-semibold text-lg text-[#994D1C] mb-1 line-clamp-1">{p.title}</h2>
              <p className="text-sm text-gray-700 line-clamp-3 mb-1 flex-1">{p.description}</p>
               {p.position && <p className="text-xs text-gray-600 mb-3">{t('project.position')}: {p.position}</p>}
              <div className="flex justify-between items-center mt-auto gap-2">
                <Link href={`/projeler/duzenle/${p._id}`} className="flex-1 text-center bg-[#FF8B5E] hover:bg-[#FFD7A8] text-white font-semibold px-3 py-1 rounded transition text-sm">{t('common.edit') || 'Düzenle'}</Link>
                <button onClick={() => setDeleteId(p._id)} className="flex-1 text-center bg-[#994D1C] hover:bg-[#7e3f17] text-white font-semibold px-3 py-1 rounded transition text-sm">{t('common.delete') || 'Sil'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center space-y-4">
            <h2 className="text-lg font-semibold text-[#994D1C]">Emin misiniz?</h2>
            <p>Bu projeyi geri alınamaz şekilde sileceksiniz.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => deleteProject(deleteId)} className="bg-[#994D1C] hover:bg-[#7e3f17] text-white px-4 py-2 rounded">Sil</button>
              <button onClick={() => setDeleteId(null)} className="bg-[#FFE5D9] hover:bg-[#FFD7A8] text-[#994D1C] px-4 py-2 rounded">Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
