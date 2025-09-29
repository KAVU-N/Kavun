'use client';
import { FaInstagram, FaLinkedin, FaEnvelope, FaFacebook, FaTwitter } from 'react-icons/fa';

export default function ContactPage() {
  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'E-posta',
      value: 'info@kavunla.com',
      href: 'mailto:info@kavunla.com'
    }
  ];

  const socialLinks = [
    { 
      icon: FaInstagram, 
      href: 'https://www.instagram.com/kavunlacom/',
      label: 'Instagram',
      description: 'Instagram hesabımızı takip edin'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 pb-16">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl font-bold text-[#994D1C] text-center mb-12">İletişim</h1>
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full">
            {/* İletişim Bilgileri */}
            <div className="space-y-6 w-full max-w-md">
              <h2 className="text-2xl font-semibold text-[#994D1C] mb-6 text-center">Bize Ulaşın</h2>
              {contactInfo.map((info) => (
                <a
                  href={info.href}
                  key={info.title}
                  className="flex items-center justify-center space-x-4 text-[#6B3416] hover:text-[#FF8B5E] transition-colors p-4 rounded-lg hover:bg-gray-50 mx-auto"
                >
                  <info.icon className="text-4xl text-[#FF8B5E]" />
                  <div>
                    <h3 className="font-semibold text-lg">{info.title}</h3>
                    <p className="text-lg">{info.value}</p>
                  </div>
                </a>
              ))}

              <div className="pt-8">
                <h3 className="font-semibold text-[#6B3416] mb-4 text-center">Sosyal Medya</h3>
                <div className="flex justify-center space-x-6">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF8B5E] hover:text-[#994D1C] transition-colors p-2 hover:bg-gray-50 rounded-full"
                      title={link.description}
                    >
                      <link.icon className="text-3xl" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}