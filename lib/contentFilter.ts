// Basit içerik filtresi
// +18 veya küfürlü kelime içeren metni yakalamak için basit bir kelime listesi kullanır.
// Gerçek hayatta daha gelişmiş NLP veya üçüncü parti servisler tercih edilmelidir.

const forbiddenWords: string[] = [
  // Türkçe küfür ve +18 anahtar kelimeler (küçük harf, noktalama hariç)
  'amk','mk','orospu','sik','siki','siktir','ananı','anan','piç','puş','yarrak','yarak','göt','got','bok','seks','sex','porn',
  // İngilizce genel küfürler
  'fuck','shit','bitch','asshole','dick','pussy','cock','motherfucker',
  // +18
  'xxx','adult','hardcore','escort'
];

export function isValidLinkedInUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return /^https?:\/\/(www\.)?linkedin\.com\//i.test(u.href);
  } catch {
    return false;
  }
}

export function containsProhibited(content: string): boolean {
  if (!content) return false;
  const normalized = content
    .toLowerCase()
    .replace(/[^a-zçğıöşü0-9\s]/gi, ' '); // noktalama temizle
  return forbiddenWords.some(word => normalized.includes(word));
}
