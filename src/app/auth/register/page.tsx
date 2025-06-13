import React, { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

// TODO: Replace with your actual site key from Google reCAPTCHA admin console
const RECAPTCHA_SITE_KEY = '6LdubVErAAAAALfSGXh8bTDiW0ir7b_PXfGROQ6h';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRecaptcha = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!recaptchaToken) {
      setError('Lütfen reCAPTCHA doğrulamasını tamamlayın.');
      return;
    }
    // TODO: Backend'e recaptchaToken ile birlikte formu gönderin
    setSuccess('Kayıt başarılı!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] text-white">
      <form onSubmit={handleSubmit} className="bg-[#23234a] p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Kayıt Ol</h2>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ad Soyad"
          required
          className="px-4 py-2 rounded bg-[#181836] border border-[#444] text-white focus:outline-none focus:border-[#FF8B5E]"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="E-posta"
          required
          className="px-4 py-2 rounded bg-[#181836] border border-[#444] text-white focus:outline-none focus:border-[#FF8B5E]"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Şifre"
          required
          className="px-4 py-2 rounded bg-[#181836] border border-[#444] text-white focus:outline-none focus:border-[#FF8B5E]"
        />
        <div className="flex justify-center my-2">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={handleRecaptcha}
            theme="dark"
          />
        </div>
        {error && <div className="text-red-400 text-center text-sm">{error}</div>}
        {success && <div className="text-green-400 text-center text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white font-semibold hover:scale-105 transition-transform disabled:opacity-60"
          disabled={!recaptchaToken}
        >
          Kayıt Ol
        </button>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Bu form Google reCAPTCHA ile korunmaktadır. <br />Devam ederek Google&apos;ın <a href="https://policies.google.com/privacy" className="underline text-[#FF8B5E]">Gizlilik Politikası</a> ve <a href="https://policies.google.com/terms" className="underline text-[#FF8B5E]">Hizmet Şartları</a>&apos;nı kabul etmiş olursunuz.
        </div>
        <div className="text-xs text-yellow-400 mt-1 text-center">
          <b>Not:</b> Google reCAPTCHA anahtarınızı <code>RECAPTCHA_SITE_KEY</code> ile değiştirin.
        </div>
      </form>
    </div>
  );
}