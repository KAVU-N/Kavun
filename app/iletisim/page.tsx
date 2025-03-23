'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaInstagram, FaLinkedin, FaDiscord, FaEnvelope, FaMapMarkerAlt, FaPhone, FaFacebook, FaTwitter } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.error || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      console.error('Form gönderimi sırasında hata:', error);
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'E-posta',
      value: 'info@kavun.org',
      href: 'mailto:info@kavun.org'
    },
    {
      icon: FaPhone,
      title: 'Telefon',
      value: '+90 (555) 123 4567',
      href: 'tel:+90 (555) 123 4567'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Adres',
      value: 'Teknokent, Yıldız Teknik Üniversitesi\nDavutpaşa Kampüsü, Esenler/İstanbul',
      href: 'https://www.google.com/maps/place/Y%C4%B1ld%C4%B1z+Teknik+%C3%9Cniversitesi/@41.0605556,28.9877778,17z/data=!3m1!4b1!4m5!3m4!1s0x14cab8f9a8a5a5a5:0x6a6a6a6a6a6a6a6a!8m2!3d41.0605556!4d28.9900001'
    }
  ];

  const socialLinks = [
    { 
      icon: FaFacebook, 
      href: 'https://www.facebook.com/codesmedipol/', 
      label: 'Facebook',
      description: 'Etkinliklerimizi ve güncel gelişmeleri takip edin'
    },
    { 
      icon: FaTwitter, 
      href: 'https://twitter.com/codesmedipol', 
      label: 'Twitter',
      description: 'Profesyonel ağımıza katılın ve kariyer fırsatlarını keşfedin'
    },
    { 
      icon: FaInstagram, 
      href: 'https://www.instagram.com/codesmedipol/', 
      label: 'Instagram',
      description: 'Topluluğumuza katılın ve diğer üyelerle etkileşime geçin'
    },
    { 
      icon: FaLinkedin, 
      href: 'https://www.linkedin.com/company/kavun', 
      label: 'LinkedIn',
      description: 'Profesyonel ağımıza katılın ve kariyer fırsatlarını keşfedin'
    },
    { 
      icon: FaDiscord, 
      href: 'https://discord.gg/kavun', 
      label: 'Discord',
      description: 'Topluluğumuza katılın ve diğer üyelerle etkileşime geçin'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFB996] to-[#FFECEC] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#994D1C] text-center mb-12">
          İletişim
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* İletişim Bilgileri */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#994D1C] mb-6">
                Bize Ulaşın
              </h2>
              
              {contactInfo.map((info) => (
                <div key={info.title} className="flex items-center space-x-4 text-[#6B3416]">
                  <info.icon className="text-2xl text-[#FF8B5E]" />
                  <div>
                    <h3 className="font-semibold">{info.title}</h3>
                    <p>{info.value}</p>
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <h3 className="font-semibold text-[#6B3416] mb-4">Sosyal Medya</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-[#FF8B5E] hover:text-[#994D1C] transition-colors">
                      <link.icon className="text-2xl" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* İletişim Formu */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#6B3416]">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#6B3416]">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#6B3416]">
                  Konu
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#6B3416]">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border-[#FFB996] shadow-sm focus:border-[#FF8B5E] focus:ring focus:ring-[#FF8B5E] focus:ring-opacity-50"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF8B5E] to-[#FFB996] text-white font-semibold py-3 px-6 rounded-md hover:from-[#994D1C] hover:to-[#FF8B5E] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? 'Gönderiliyor...' : 'Gönder'}
              </button>

              {success && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-emerald-600 text-center mt-4"
                >
                  Mesajınız başarıyla gönderildi!
                </motion.p>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-center mt-4"
                >
                  {error}
                </motion.p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}