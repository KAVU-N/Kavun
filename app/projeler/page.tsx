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
  interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkedinUrl: string;
  category: string;
  ownerId: string;
}

    const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "">("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Projeler alınamadı");
        const data = await res.json();
        setProjects(data);
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
      const inSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const inCategory = categoryFilter ? p.category === categoryFilter : true;
      const isMine = onlyMine ? p.ownerId === user?._id : true;
      return inSearch && inCategory && isMine;
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-28 pb-12">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-[#994D1C]">
        {t("nav.projects")}
      </h1>
        <Link href="/projeler/olustur" className="bg-[#994D1C] text-white px-4 py-2 rounded hover:bg-[#7e3f17] transition whitespace-nowrap">
          + {(t("common.create") as string) || "Proje Ekle"}
        </Link>
      </div>
      {/* Arama ve Filtreleme */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Proje adı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pr-10 rounded-xl border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 flex-1"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border-[#FFB996] focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50 transition"
        >
          <option value="">Tüm Kategoriler</option>
          <option value="Genel">Genel</option>
          <option value="Web">Web</option>
          <option value="Mobil">Mobil</option>
          <option value="Yapay Zeka">Yapay Zeka</option>
        </select>
        {user && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
            Sadece Benim
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
              <span className="bg-[#FF8B5E] text-white text-xs px-2 py-1 rounded-lg flex-shrink-0">{p.category}</span>
            </div>
            <p className="text-sm text-[#6B3416] line-clamp-3 mb-3 flex-1">{p.description}</p>
            <Link href={`/projeler/${p._id}`} className="w-full bg-[#FF8B5E] hover:bg-[#FFD7A8] text-white font-semibold py-2 rounded-lg text-center transition block mt-auto">Proje Detayı</Link>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
