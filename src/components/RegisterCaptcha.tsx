import React, { useState } from 'react';

function generateCaptcha(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function CaptchaSVG({ code }: { code: string }) {
  // Basit bozuk arka planlı SVG, kopyalanamaz, kodu seçilemez
  return (
    <svg width="110" height="40" style={{background: '#f3f3f3', borderRadius: 8, userSelect: 'none'}}>
      <defs>
        <filter id="blur" x="0" y="0">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      {/* Arka plan bozuklukları */}
      <rect x="0" y="0" width="110" height="40" fill="#f3f3f3" />
      <ellipse cx="30" cy="20" rx="24" ry="14" fill="#ffe1c3" filter="url(#blur)"/>
      <ellipse cx="80" cy="22" rx="20" ry="10" fill="#ffd6ad" filter="url(#blur)"/>
      <ellipse cx="60" cy="12" rx="12" ry="6" fill="#fff2e0" filter="url(#blur)"/>
      {/* Kod */}
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        fontSize="22"
        fontFamily="monospace"
        fill="#994D1C"
        style={{ fontWeight: 700, letterSpacing: 4, userSelect: 'none', pointerEvents: 'none' }}
        dominantBaseline="middle"
      >
        {code}
      </text>
    </svg>
  );
}

export default function RegisterCaptcha({ onVerify }: { onVerify: (valid: boolean) => void }) {
  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState('');
  const [captcha, setCaptcha] = useState<string>(generateCaptcha());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCheck = () => {
    if (value.trim().toUpperCase() === captcha.toUpperCase()) {
      setError('');
      setSuccess(true);
      onVerify(true);
    } else {
      setError('Doğrulama başarısız. Lütfen tekrar deneyin.');
      setCaptcha(generateCaptcha());
      setValue('');
      setSuccess(false);
      onVerify(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => { setChecked(e.target.checked); setError(''); setSuccess(false); setCaptcha(generateCaptcha()); setValue(''); onVerify(false); }}
          className="accent-[#FFB996] w-4 h-4"
        />
        <span className="text-sm font-medium text-[#6B3416]">Ben robot değilim</span>
      </label>
      {/* Captcha alanı sadece checkbox işaretliyse */}
      {checked && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-3">
            <CaptchaSVG code={captcha} />
            <input
              type="text"
              className="rounded border px-2 py-1 w-32 text-lg"
              placeholder="Yukarıdaki kod"
              value={value}
              autoComplete="off"
              spellCheck={false}
              onPaste={e => e.preventDefault()}
              onCopy={e => e.preventDefault()}
              onCut={e => e.preventDefault()}
              onChange={e => { setValue(e.target.value); setError(''); setSuccess(false); }}
              onKeyDown={e => { if (e.key === 'Enter') handleCheck(); }}
            />
            <button type="button" onClick={handleCheck} className="px-3 py-1 bg-[#FFB996] text-white rounded">Doğrula</button>
          </div>
          {error && <div className="text-red-500 mt-1 text-xs">{error}</div>}
          {success && <div className="text-green-600 mt-1 text-xs">Doğrulama başarılı!</div>}
        </div>
      )}
    </div>
  );
}
