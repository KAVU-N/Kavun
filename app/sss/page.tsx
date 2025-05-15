import React from 'react';

const SSSPage = () => {
  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Sıkça Sorulan Sorular</h1>
      
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Kavunla nedir?</h2>
          <p className="text-gray-700">Kavunla, aynı üniversitede bulunan ders almak ve vermek isteyen öğrencileri bir araya getiren bir eğitim platformudur. Aynı zamanda platformumuz sayesinde öğrenciler dersleri ile alakalı kaynaklara ulaşma imkanı elde edebilecektir.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Nasıl kayıt olabilirim?</h2>
          <p className="text-gray-700">Ana sayfadaki "Kayıt Ol" butonuna tıklayarak üniversite e-posta adresiniz ve yeni oluşturacağınız şifreniz ile hızlıca kayıt olabilirsiniz.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Eğitmen olarak nasıl ilan verebilirim?</h2>
          <p className="text-gray-700">Kayıt ol sayfasında bulunan rol kısmından eğitmen seçeneğini seçerek platforma eğitmen olarak giriş yapabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
};

export default SSSPage;