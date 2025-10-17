'use client';
import React, { useState } from 'react';
import { FaQuestionCircle, FaUserPlus, FaBullhorn, FaRegMoneyBillAlt, FaTools } from 'react-icons/fa';
import { useLanguage } from '@/src/contexts/LanguageContext';

const SSSPage = () => {
  const { t } = useLanguage();
  const faqTopics = [
    {
      topic: t('faqPage.topics.general'),
      colorFrom: '#FFB996',
      colorTo: '#FFF5F0',
      icon: <FaQuestionCircle className="text-3xl text-[#FF8B5E]" />,
      questions: [
        {
          question: t('faqPage.general.q1.question'),
          answer: t('faqPage.general.q1.answer')
        },
        {
          question: t('faqPage.general.q2.question'),
          answer: t('faqPage.general.q2.answer')
        },
      ]
    },
    {
      topic: t('faqPage.topics.account'),
      colorFrom: '#FF8B5E',
      colorTo: '#FFD6BA',
      icon: <FaUserPlus className="text-3xl text-[#FFB996]" />,
      questions: [
        {
          question: t('faqPage.account.q1.question'),
          answer: t('faqPage.account.q1.answer')
        },
      ]
    },
    {
      topic: t('faqPage.topics.listings'),
      colorFrom: '#FFD6BA',
      colorTo: '#FFB996',
      icon: <FaBullhorn className="text-3xl text-[#994D1C]" />,
      questions: [
        {
          question: t('faqPage.listings.q1.question'),
          answer: t('faqPage.listings.q1.answer')
        },
      ]
    },
    {
      topic: t('faqPage.topics.payments'),
      colorFrom: '#FFF5F0',
      colorTo: '#FFD6BA',
      icon: <FaRegMoneyBillAlt className="text-3xl text-[#6B3416]" />,
      questions: [
        {
          question: t('faqPage.payments.q1.question'),
          answer: t('faqPage.payments.q1.answer')
        },
      ]
    },
    {
      topic: t('faqPage.topics.support'),
      colorFrom: '#FFB996',
      colorTo: '#FFE5D9',
      icon: <FaTools className="text-3xl text-[#FF8B5E]" />,
      questions: [
        {
          question: t('faqPage.support.q1.question'),
          answer: t('faqPage.support.q1.answer')
        },
        {
          question: t('faqPage.support.q2.question'),
          answer: t('faqPage.support.q2.answer')
        },
      ]
    }
  ];
  const [openTopic, setOpenTopic] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 pt-28 pb-20 min-h-screen relative z-10">
      <h1 className="text-4xl font-bold mb-12 text-center text-[#994D1C] tracking-tight drop-shadow-lg">
        {t('faqPage.title')}
      </h1>
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {faqTopics.map((topic, idx) => (
          <div key={idx}>
            <button
              className={`w-full flex items-center gap-4 rounded-2xl px-8 py-6 shadow-lg border-2 border-[#FFD6BA] bg-gradient-to-r from-[${topic.colorFrom}] to-[${topic.colorTo}] transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5E] group ${openTopic === idx ? 'ring-2 ring-[#FF8B5E]' : ''}`}
              onClick={() => setOpenTopic(openTopic === idx ? null : idx)}
              aria-expanded={openTopic === idx}
            >
              <span className="flex-shrink-0">{topic.icon}</span>
              <span className="text-xl font-bold text-[#994D1C] tracking-tight bg-clip-text drop-shadow-sm">
                {topic.topic}
              </span>
              <span className={`ml-auto text-3xl transition-transform duration-300 ${openTopic === idx ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ${openTopic === idx ? 'max-h-[1000px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}`}
            >
              {openTopic === idx && (
                <div className="flex flex-col gap-6 px-4">
                  {topic.questions.map((q, qidx) => (
                    <div key={qidx} className="bg-white/90 rounded-xl border border-[#FFD6BA] shadow-md p-6 animate-fadeIn">
                      <h3 className="text-lg font-semibold mb-2 text-[#FF8B5E] flex items-center">
                        <FaQuestionCircle className="mr-2 text-[#FFB996]" />
                        {q.question}
                      </h3>
                      <p className="text-[#6B3416] text-base leading-relaxed font-medium tracking-wide">
                        {q.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SSSPage;