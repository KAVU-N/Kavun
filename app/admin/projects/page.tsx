"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/src/contexts/LanguageContext";

interface Project {
  _id: string;
  title: string;
  description: string;
  ownerId: string;
  category: string;
  linkedinUrl?: string;
  contact?: string;
  status?: string;
}

export default function AdminProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8B5E]"></div>
      </div>
    );
  if (error) return <p className="text-red-500 text-center py-20">{error}</p>;

  const filtered = projects.filter((p) =>
    (category ? p.category === category : true) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-2xl font-bold mb-6 text-[#994D1C]">Tüm Projeler ({filtered.length})</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara..."
          className="flex-1 border p-2 rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-48"
        >
          <option value="">Tüm Kategoriler</option>
          <option value="Genel">Genel</option>
          <option value="Web">Web</option>
          <option value="Mobil">Mobil</option>
          <option value="Yapay Zeka">Yapay Zeka</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-600 italic">Proje bulunamadı.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex flex-col p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-[#994D1C] line-clamp-2 flex-1 pr-2">
                  {p.title}
                </h2>
                <span className="bg-[#FF8B5E] text-white text-xs px-2 py-1 rounded-lg flex-shrink-0">
                  {p.category}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3 mb-3 flex-1">{p.description}</p>
              <div className="text-xs text-gray-500 mb-2">Owner: {p.ownerId}</div>
              <div className="flex gap-2 mt-auto">
                <a href={`/projeler/${p._id}`} target="_blank" className="flex-1 text-center bg-[#FF8B5E]/80 hover:bg-[#FF8B5E] text-white font-semibold px-3 py-1 rounded text-sm">Detay</a>
                {p.linkedinUrl && (
                  <a
                    href={p.linkedinUrl}
                    target="_blank"
                    className="flex-1 text-center bg-[#FF8B5E] hover:bg-[#FFD7A8] text-white font-semibold px-3 py-1 rounded text-sm"
                  >
                    LinkedIn
                  </a>
                )}
                <button
                  onClick={() => setDeleteId(p._id)}
                  className="flex-1 text-center bg-[#994D1C] hover:bg-[#7e3f17] text-white font-semibold px-3 py-1 rounded text-sm"
                >
                  Sil
                </button>
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
              <button
                onClick={() => deleteProject(deleteId)}
                className="bg-[#994D1C] hover:bg-[#7e3f17] text-white px-4 py-2 rounded"
              >
                Sil
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="bg-[#FFE5D9] hover:bg-[#FFD7A8] text-[#994D1C] px-4 py-2 rounded"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
