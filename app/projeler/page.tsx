"use client";

import React from "react";
import { useLanguage } from "@/src/contexts/LanguageContext";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function ProjectsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

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

  const categoryOptions = Object.keys(categoryValueMap).map((key) => ({ value: key, labelKey: key }));

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
  interface Project {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    linkedinUrl: string;
    category: string;
    ownerId: string;
    ownerName?: string;
    ownerUniversity?: string;
    position?: string;
    views?: number;
  }

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "">("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const myId = (user as any)?._id || (user as any)?.id;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Projeler alınamadı");
        const data = await res.json();

        const ownerIds = Array.from(
          new Set(
            (data as Project[])
              .map((project) => project.ownerId)
              .filter((id): id is string => Boolean(id))
          )
        );

        const ownerDetails: Record<string, { university?: string; name?: string }> = {};

        await Promise.all(
          ownerIds.map(async (id) => {
            try {
              const ownerRes = await fetch(`/api/users/public/${id}`);
              if (ownerRes.ok) {
                ownerDetails[id] = await ownerRes.json();
              } else {
                ownerDetails[id] = {};
              }
            } catch (error) {
              ownerDetails[id] = {};
            }
          })
        );

        const enrichedProjects = (data as Project[]).map((project) => {
          const ownerInfo = ownerDetails[project.ownerId] || {};
          return {
            ...project,
            ownerUniversity: ownerInfo.university || project.ownerUniversity,
            ownerName: ownerInfo.name || project.ownerName,
          };
        });

        setProjects(enrichedProjects);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = () => {
    return projects.filter((p) => {
      const inSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || (p.position ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const currentCategoryKey = mapCategoryToKey(p.category);
      const inCategory = categoryFilter ? categoryFilter === currentCategoryKey : true;
      const isMine = onlyMine ? p.ownerId === myId : true;
      const inPosition = positionFilter ? (p.position ?? '').toLowerCase().includes(positionFilter.toLowerCase()) : true;
       return inSearch && inCategory && isMine && inPosition;
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
      <div className="bg-white/80 backdrop-blur-sm border border-[var(--brand-border)] rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-[#994D1C]">
          {t("nav.projects")}
        </h1>
        <Link
          href={user ? '/projeler/olustur' : '/auth/login'}
          className="bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white px-4 py-2 rounded-lg hover:shadow-md hover:shadow-[#FFB996]/20 transition-all duration-300 whitespace-nowrap"
        >
          + {t('common.createProject')}
        </Link>
      </div>
       {/* Arama ve Filtreleme */}
       <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <input
          type="text"
          placeholder={t('general.search') + '...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
        />
        <select
           value={categoryFilter}
           onChange={(e) => setCategoryFilter(e.target.value)}
           className="w-full md:w-40 px-4 py-3 rounded-xl border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 transition"
         >
          <option value="">{t('category.all')}</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder={t('project.positionPlaceholder') as string}
          value={positionFilter}
          onChange={(e)=>setPositionFilter(e.target.value)}
          className="w-full md:w-56 px-4 py-3 rounded-xl border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 transition"
        />
        {user && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
            {t('filter.onlyMine')}
          </label>
        )}
      </div>
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {filteredProjects().length === 0 && !loading ? (
        <p className="text-gray-600 italic">Henüz proje bulunamadı.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects().map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex flex-col p-4">

              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-[#994D1C] line-clamp-2 flex-1 pr-2">{p.title}</h2>
                <span className="bg-[#FF8B5E] text-white text-xs px-2 py-1 rounded-lg flex-shrink-0">
                  {t(mapCategoryToKey(p.category))}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3 mb-1 flex-1">{p.description}</p>
              {p.position && <p className="text-xs text-gray-600 mb-1">{t('project.position')}: {p.position}</p>}
              <p className="text-xs text-gray-600 mb-3">{t('auth.university')}: {p.ownerUniversity || t('general.notSpecified')}</p>
              <div className="flex justify-between items-center mt-auto pt-2">
                <span className="text-xs text-gray-500 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>{p.views || 0}</span>
                <Link href={`/projeler/${p._id}`} className="bg-[#FF8B5E] hover:bg-[#FFD7A8] text-white font-semibold py-2 px-3 rounded-lg text-center transition">{t('project.detail')}</Link>
               </div>
            </div>
          ))}
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
