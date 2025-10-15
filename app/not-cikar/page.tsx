'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useAuth } from 'src/context/AuthContext';

interface NoteItem {
  id: number;
  content: string;
}

export default function NotesGeneratorPage() {
  const { t, language } = useLanguage();
  const { user, authChecked } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<'academic' | 'simple'>('academic');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manualText, setManualText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (authChecked && !user) {
      router.push('/auth/login');
    }
  }, [authChecked, user, router]);

  if (!authChecked) {
    return null;
  }

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden pt-24 pb-16">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm border border-[#FFE5D9] rounded-2xl shadow-sm p-8 text-center max-w-md">
            <h1 className="text-2xl font-semibold text-[#994D1C] mb-3">{t('nav.aiNotes')}</h1>
            <p className="text-[#6B3416] text-sm leading-relaxed">
              {language === 'en'
                ? 'You need to log in to access the note generator.'
                : 'Not çıkarma aracını kullanmak için giriş yapmanız gerekiyor.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!selectedFile && !manualText.trim()) {
      setError(t('ai.common.missingSource'));
      return;
    }

    setLoading(true);
    setNotes([]);

    try {
      const formData = new FormData();
      formData.append('tone', tone);
      formData.append('prompt', prompt);
      formData.append('text', manualText);
      formData.append('language', language);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/ai/notes', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = typeof data?.message === 'string' ? data.message : response.statusText;
        setError(
          data?.error === 'MISSING_SOURCE'
            ? t('ai.common.missingSource')
            : t('ai.common.apiError', { message }),
        );
        return;
      }

      const generated: string[] = Array.isArray(data?.notes) ? data.notes : [];
      setNotes(
        generated.map((content, index) => ({
          id: index + 1,
          content,
        })),
      );
    } catch (err) {
      console.error('[NOTES_FORM]', err);
      setError(t('ai.common.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }
    const file = files[0];
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-16">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="bg-white/80 backdrop-blur-sm border border-[#FFE5D9] rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-[#994D1C] mb-3">
              {t('nav.aiNotes')}
            </h1>
            <p className="text-[#6B3416] text-base leading-relaxed">
              {t('ai.notes.description')}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6">
            <section className="bg-white/85 backdrop-blur-sm border border-[#FFE5D9] rounded-2xl shadow-sm p-6">
              <form className="space-y-6" onSubmit={handleGenerate}>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#6B3416]">
                    {t('ai.notes.uploadLabel')}
                  </label>
                  <label className="flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-[#FFB996] rounded-2xl bg-[#FFF9F5] text-center cursor-pointer transition hover:border-[#FF8B5E]">
                    <span className="text-[#994D1C] font-medium">
                      {t('ai.notes.uploadHint')}
                    </span>
                    <span className="text-xs text-[#6B3416]">
                      {t('ai.notes.uploadSubHint')}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(event) => handleFileChange(event.target.files)}
                    />
                  </label>
                  <div className="text-sm text-[#6B3416]">
                    {selectedFile ? (
                      <div className="flex items-center justify-between bg-[#FFF2EA] border border-[#FFD6B2] rounded-xl px-3 py-2 mt-2">
                        <span>
                          {t('ai.common.fileSelected')}: <strong>{selectedFile.name}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-[#994D1C] hover:text-[#FF8B5E] text-sm font-semibold"
                        >
                          {t('ai.common.removeFile')}
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-[#6B3416]">{t('ai.common.noFileSelected')}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="manualText" className="block text-sm font-semibold text-[#6B3416]">
                    {t('ai.notes.textLabel')}
                  </label>
                  <textarea
                    id="manualText"
                    value={manualText}
                    onChange={(event) => setManualText(event.target.value)}
                    rows={4}
                    placeholder={t('ai.notes.textPlaceholder') || ''}
                    className="w-full px-4 py-3 rounded-xl border border-[#FFB996] focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-[#FF8B5E] text-sm text-[#6B3416]"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="prompt" className="block text-sm font-semibold text-[#6B3416]">
                    {t('ai.notes.promptsLabel')}
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    rows={5}
                    placeholder={t('ai.notes.promptsPlaceholder') || ''}
                    className="w-full px-4 py-3 rounded-xl border border-[#FFB996] focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-[#FF8B5E] text-sm text-[#6B3416]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#6B3416] mb-1">
                      {t('ai.notes.toneLabel')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTone('academic')}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                          tone === 'academic'
                            ? 'bg-[#FF8B5E] text-white border-[#FF8B5E] shadow-sm'
                            : 'bg-[#FFF5F0] text-[#994D1C] border-[#FFB996] hover:bg-[#FFE5D9]'
                        }`}
                      >
                        {t('ai.notes.toneAcademic')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTone('simple')}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                          tone === 'simple'
                            ? 'bg-[#FF8B5E] text-white border-[#FF8B5E] shadow-sm'
                            : 'bg-[#FFF5F0] text-[#994D1C] border-[#FFB996] hover:bg-[#FFE5D9]'
                        }`}
                      >
                        {t('ai.notes.toneSimple')}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-semibold rounded-xl shadow-sm hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? t('ai.notes.generating') : t('ai.notes.generateButton')}
                  </button>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
                    {error}
                  </div>
                )}
              </form>
            </section>
          </div>

          <section className="bg-white/85 backdrop-blur-sm border border-[#FFE5D9] rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#994D1C] mb-4">{t('ai.notes.resultsTitle')}</h2>
            {notes.length === 0 ? (
              <div className="text-sm text-[#6B3416] bg-[#FFF9F5] border border-[#FFE5D9] rounded-xl p-4">
                {t('ai.notes.resultsPlaceholder')}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-[#FFE5D9] bg-[#FFF9F5] text-[#6B3416] space-y-2">
                {notes.map((item) => (
                  <p key={item.id} className="text-sm leading-relaxed before:content-['•'] before:mr-2">
                    {item.content}
                  </p>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
