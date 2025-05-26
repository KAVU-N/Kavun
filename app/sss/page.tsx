'use client';
import React, { useState } from 'react';
import { FaQuestionCircle, FaUserPlus, FaBullhorn, FaRegMoneyBillAlt, FaTools, FaShieldAlt, FaUsers } from 'react-icons/fa';

const faqTopics = [
  {
    topic: 'Genel Bilgiler',
    colorFrom: '#FFB996',
    colorTo: '#FFF5F0',
    icon: <FaQuestionCircle className="text-3xl text-[#FF8B5E]" />,
    questions: [
      {
        question: 'Kavunla nedir?',
        answer: 'Kavunla, aynı üniversitede bulunan ders almak ve vermek isteyen öğrencileri bir araya getiren bir eğitim platformudur. Aynı zamanda platformumuz sayesinde öğrenciler dersleri ile alakalı kaynaklara ulaşma imkanı elde edebilecektir.'
      },
      {
        question: 'Kavunla\'ya kimler katılabilir?',
        answer: 'Kavunla Eğitim Platformu\'na öğrenciler, eğitmenler ve öğrenmeye ilgi duyan kişiler katılabilir. Üyelik tamamen ücretsizdir.'
      },
    ]
  },
  {
    topic: 'Kayıt ve Hesap',
    colorFrom: '#FF8B5E',
    colorTo: '#FFD6BA',
    icon: <FaUserPlus className="text-3xl text-[#FFB996]" />,
    questions: [
      {
        question: 'Nasıl kayıt olabilirim?',
        answer: 'Ana sayfadaki "Kayıt Ol" butonuna tıklayarak üniversite e-posta adresiniz ve yeni oluşturacağınız şifreniz ile hızlıca kayıt olabilirsiniz.'
      },
    ]
  },
  {
    topic: 'İlanlar ve Kullanım',
    colorFrom: '#FFD6BA',
    colorTo: '#FFB996',
    icon: <FaBullhorn className="text-3xl text-[#994D1C]" />,
    questions: [
      {
        question: 'Kendi ilanımı nasıl oluşturabilirim?',
        answer: 'Eğer öğretmenseniz, "İlan Ver" sayfasından ilanınızı oluşturabilir ve yayına alabilirsiniz.'
      },
    ]
  },
  {
    topic: 'Ödemeler',
    colorFrom: '#FFF5F0',
    colorTo: '#FFD6BA',
    icon: <FaRegMoneyBillAlt className="text-3xl text-[#6B3416]" />,
    questions: [
      {
        question: 'Ödemeler nasıl gerçekleşiyor?',
        answer: 'Şu anda platform tamamen gönüllülük esasına dayalı olarak hizmet vermektedir ve herhangi bir ücret alınmamaktadır.'
      },
    ]
  },
  {
    topic: 'Destek ve Güvenlik',
    colorFrom: '#FFB996',
    colorTo: '#FFE5D9',
    icon: <FaTools className="text-3xl text-[#FF8B5E]" />,
    questions: [
      {
        question: 'Platformda yaşadığım teknik bir sorunu nasıl bildiririm?',
        answer: '“İletişim” sayfasındaki formu doldurarak veya destek e-posta adresimize yazarak teknik sorunlarınızı iletebilirsiniz. Destek ekibimiz en kısa sürede sizinle iletişime geçecektir.'
      },
      {
        question: 'Kişisel bilgilerim güvende mi?',
        answer: 'Kişisel verileriniz, KVKK ve GDPR gibi yasal düzenlemelere uygun olarak güvenli bir şekilde saklanır ve asla üçüncü kişilerle paylaşılmaz.'
      },
    ]
  },
];

const SSSPage = () => {
  const [openTopic, setOpenTopic] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 pt-28 pb-20 min-h-screen bg-gradient-to-br from-[#FFF5F0] via-[#FFF8F2] to-[#FFE5D9]">
      <h1 className="text-4xl font-bold mb-12 text-center text-[#994D1C] tracking-tight drop-shadow-lg">
        Sıkça Sorulan Sorular
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