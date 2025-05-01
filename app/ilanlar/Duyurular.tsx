import React, { useEffect, useState } from "react";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  date?: string;
  target: 'all' | 'student' | 'teacher';
}

interface DuyurularProps {
  userRole: 'student' | 'teacher';
}

export default function Duyurular({ userRole }: DuyurularProps) {
  const [duyurular, setDuyurular] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDuyurular = async () => {
      setLoading(true);
      const res = await fetch('/api/admin/announcements');
      if (res.ok) {
        const all = await res.json();
        // Yalnızca hedefi "all" veya kullanıcının rolüne uygun olanları göster
        setDuyurular(all.filter((d: Announcement) => d.target === 'all' || d.target === userRole));
      }
      setLoading(false);
    };
    fetchDuyurular();
  }, [userRole]);

  if (loading) return <div>Duyurular yükleniyor...</div>;
  if (!duyurular.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-blue-800 mb-2">Duyurular</h2>
      <ul className="space-y-2">
        {duyurular.map(d => (
          <li key={d._id} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded shadow">
            <div className="font-semibold text-yellow-800">{d.title}</div>
            <div className="text-gray-700 text-sm">{d.content}</div>
            <div className="text-xs text-gray-400 mt-1">{d.date ? new Date(d.date).toLocaleDateString() : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
