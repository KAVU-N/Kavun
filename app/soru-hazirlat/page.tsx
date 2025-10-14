'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { useAuth } from 'src/context/AuthContext';

interface GeneratedQuestion {
  id: number;
  text: string;
  choices?: string[];
  answerIndex?: number;
  answer?: string;
}

export default function QuestionGeneratorPage() {
  const { t, language } = useLanguage();
  const { user, authChecked } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState<'multipleChoice' | 'openEnded'>('multipleChoice');
  const [choiceCount, setChoiceCount] = useState(4);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
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
            <h1 className="text-2xl font-semibold text-[#994D1C] mb-3">{t('nav.aiAssistant')}</h1>
            <p className="text-[#6B3416] text-sm leading-relaxed">
              {language === 'en'
                ? 'You need to log in to access the question generator.'
                : 'Soru hazırlama aracını kullanmak için giriş yapmanız gerekiyor.'}
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
    setQuestions([]);
    setShowAnswerKey(false);

    try {
      const formData = new FormData();
      formData.append('questionCount', String(questionCount));
      formData.append('questionType', questionType);
      if (questionType === 'multipleChoice') {
        formData.append('choiceCount', String(choiceCount));
      }
      formData.append('prompt', prompt);
      formData.append('text', manualText);
      formData.append('language', language);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/ai/question-generator', {
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

      const apiQuestions: any[] = Array.isArray(data?.questions) ? data.questions : [];
      const normalized = apiQuestions.reduce<GeneratedQuestion[]>((acc, item, index) => {
        const questionText =
          typeof item?.question === 'string' && item.question.trim().length > 0
            ? item.question.trim()
            : typeof item === 'string'
              ? item.trim()
              : '';

        if (!questionText) {
          return acc;
        }

        const rawChoices = Array.isArray(item?.choices)
          ? item.choices
              .map((choice: any) => (typeof choice === 'string' ? choice.trim() : String(choice || '')))
              .filter((choice: string) => choice.length > 0)
          : undefined;

        const answerIndexRaw = item?.answerIndex;
        const answerIndex =
          typeof answerIndexRaw === 'number' && Number.isInteger(answerIndexRaw) ? answerIndexRaw : undefined;

        const answerText = typeof item?.answer === 'string' && item.answer.trim().length > 0 ? item.answer.trim() : undefined;

        acc.push({
          id: index + 1,
          text: questionText,
          choices: rawChoices && rawChoices.length > 0 ? rawChoices : undefined,
          answerIndex,
          answer: answerText,
        });

        return acc;
      }, []);

      setQuestions(normalized);
      setShowAnswerKey(false);
    } catch (err: any) {
      console.error('[QUESTION_GENERATOR_FORM]', err);
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
              {t('nav.aiAssistant')}
            </h1>
            <p className="text-[#6B3416] text-base leading-relaxed">
              {t('ai.question.description')}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 bg-white/85 backdrop-blur-sm border border-[#FFE5D9] rounded-2xl shadow-sm p-6">
              <form className="space-y-6" onSubmit={handleGenerate}>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#6B3416]">
                    {t('ai.question.uploadLabel')}
                  </label>
                  <label className="flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-[#FFB996] rounded-2xl bg-[#FFF9F5] text-center cursor-pointer transition hover:border-[#FF8B5E]">
                    <span className="text-[#994D1C] font-medium">
                      {t('ai.question.uploadHint')}
                    </span>
                    <span className="text-xs text-[#6B3416]">
                      {t('ai.question.uploadSubHint')}
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
                    {t('ai.question.textLabel')}
                  </label>
                  <textarea
                    id="manualText"
                    value={manualText}
                    onChange={(event) => setManualText(event.target.value)}
                    rows={4}
                    placeholder={t('ai.question.textPlaceholder') || ''}
                    className="w-full px-4 py-3 rounded-xl border border-[#FFB996] focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-[#FF8B5E] text-sm text-[#6B3416]"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="prompt" className="block text-sm font-semibold text-[#6B3416]">
                    {t('ai.question.notesLabel')}
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    rows={5}
                    placeholder={t('ai.question.notesPlaceholder') || ''}
                    className="w-full px-4 py-3 rounded-xl border border-[#FFB996] focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-[#FF8B5E] text-sm text-[#6B3416]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-4">
                    <label htmlFor="questionCount" className="block text-sm font-semibold text-[#6B3416] mb-1">
                      {t('ai.question.countLabel')}
                    </label>
                    <input
                      id="questionCount"
                      type="number"
                      min={1}
                      max={20}
                      value={questionCount}
                      onChange={(event) => setQuestionCount(Number(event.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#FFB996] focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-[#FF8B5E] text-sm text-[#6B3416]"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-[#6B3416] mb-1">
                          {t('ai.question.typeLabel')}
                        </label>
                        <div className="flex rounded-xl border border-[#FFB996] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setQuestionType('multipleChoice')}
                            className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                              questionType === 'multipleChoice'
                                ? 'bg-[#FF8B5E] text-white'
                                : 'bg-white text-[#994D1C]'
                            }`}
                          >
                            {t('ai.question.typeMultipleChoice')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuestionType('openEnded')}
                            className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                              questionType === 'openEnded'
                                ? 'bg-[#FF8B5E] text-white'
                                : 'bg-white text-[#994D1C]'
                            }`}
                          >
                            {t('ai.question.typeOpenEnded')}
                          </button>
                        </div>
                      </div>
                      {questionType === 'multipleChoice' && (
                        <div>
                          <label htmlFor="choiceCount" className="block text-sm font-semibold text-[#6B3416] mb-1">
                            {t('ai.question.choiceCountLabel')}
                          </label>
                          <input
                            id="choiceCount"
                            type="number"
                            min={2}
                            max={6}
                            value={choiceCount}
                            onChange={(event) => setChoiceCount(Number(event.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-[#FFB996] focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] focus:border-[#FF8B5E] text-sm text-[#6B3416]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-semibold rounded-xl shadow-sm hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? t('ai.question.generating') : t('ai.question.generateButton')}
                  </button>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
                    {error}
                  </div>
                )}
              </form>
            </section>

            <aside className="bg-white/75 backdrop-blur-sm border border-[#FFE5D9] rounded-2xl shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[#994D1C] mb-2">{t('ai.question.howItWorksTitle')}</h2>
                <p className="text-sm text-[#6B3416] leading-relaxed">
                  {t('ai.question.howItWorksDescription')}
                </p>
              </div>
              <div className="bg-[#FFF2EA] border border-[#FFD6B2] rounded-xl p-4 space-y-2 text-sm text-[#6B3416]">
                <p className="font-semibold text-[#994D1C]">{t('ai.question.tipTitle')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('ai.question.tipLine1')}</li>
                  <li>{t('ai.question.tipLine2')}</li>
                  <li>{t('ai.question.tipLine3')}</li>
                </ul>
              </div>
            </aside>
          </div>

          <section className="bg-white/85 backdrop-blur-sm border border-[#FFE5D9] rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#994D1C] mb-4">{t('ai.question.resultsTitle')}</h2>
            {questions.length === 0 ? (
              <div className="text-sm text-[#6B3416] bg-[#FFF9F5] border border-[#FFE5D9] rounded-xl p-4">
                {t('ai.question.resultsPlaceholder')}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.some(
                  (question) =>
                    (question.choices && typeof question.answerIndex === 'number') || typeof question.answer === 'string',
                ) && (
                  <div className="rounded-xl border border-[#FFD6B2] bg-[#FFF2EA] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-[#994D1C]">
                        {t('ai.question.answerKeyTitle')}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAnswerKey((prev) => !prev)}
                        className="flex items-center gap-2 text-sm font-semibold text-[#994D1C] hover:text-[#FF8B5E] transition"
                      >
                        <span aria-hidden="true">👁️</span>
                        {showAnswerKey ? t('ai.question.answerKeyHide') : t('ai.question.answerKeyShow')}
                      </button>
                    </div>
                    {showAnswerKey && (
                      <ol className="mt-3 space-y-2 text-sm text-[#6B3416]">
                        {questions.map((question) => {
                          const letter =
                            typeof question.answerIndex === 'number'
                              ? String.fromCharCode(65 + question.answerIndex)
                              : undefined;
                          const choiceText =
                            typeof question.answerIndex === 'number' &&
                            question.choices &&
                            question.choices[question.answerIndex]
                              ? question.choices[question.answerIndex]
                              : undefined;
                          const displayAnswer =
                            choiceText ?? question.answer ?? t('ai.question.answerUnavailable');

                          return (
                            <li key={`answer-${question.id}`} className="rounded-lg bg-white/70 px-3 py-2 shadow-sm">
                              <p className="font-semibold text-[#994D1C]">
                                {question.id}. {question.text}
                              </p>
                              <p className="mt-1">
                                {letter ? `${letter}. ${displayAnswer}` : displayAnswer}
                              </p>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                )}

                <ul className="space-y-3">
                  {questions.map((question) => (
                    <li
                      key={question.id}
                      className="p-4 rounded-xl border border-[#FFE5D9] bg-[#FFF9F5] text-[#6B3416] text-sm space-y-3"
                    >
                      <p className="font-semibold text-[#994D1C]">
                        {question.id}. {question.text}
                      </p>
                      {question.choices && question.choices.length > 0 && (
                        <ul className="space-y-2">
                          {question.choices.map((choice, choiceIndex) => (
                            <li key={`${question.id}-choice-${choiceIndex}`} className="flex items-start gap-2">
                              <span className="font-semibold text-[#994D1C]">
                                {String.fromCharCode(65 + choiceIndex)}.
                              </span>
                              <span>{choice}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
