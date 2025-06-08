import path from "path";
import fs from "fs";

const keyboardPatterns = [
  "qwe", "asd", "zxc", "abc", "xyz", "qwerty", "asdf", "asdfg", "zxcvb"
];

function hasKeyboardPattern(word: string): boolean {
  const w = word.toLowerCase();
  return keyboardPatterns.some(pattern => w.includes(pattern));
}

function hasRepeatingChars(word: string): boolean {
  // Aynı harf 3 veya daha fazla kez arka arkaya
  return /(.)\1{2,}/.test(word);
}

function allCharsSame(word: string): boolean {
  return /^([a-zA-ZğüşöçıİĞÜŞÖÇ])\1+$/.test(word);
}

function loadCommonNames(): string[] {
  try {
    const filePath = path.join(process.cwd(), "app", "api", "auth", "register", "commonNamesTR.json");
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data).map((n: string) => n.toLocaleLowerCase("tr-TR"));
  } catch (e) {
    return [];
  }
}

function isTurkishName(word: string, commonNames: string[]): boolean {
  return commonNames.includes(word.toLocaleLowerCase("tr-TR"));
}

function isProperNameFormat(name: string): boolean {
  // Her kelime başı büyük, devamı küçük harf
  return name.trim().split(/\s+/).every(w => w[0] === w[0].toLocaleUpperCase("tr-TR") && w.slice(1) === w.slice(1).toLocaleLowerCase("tr-TR"));
}

export function loadBannedWords(): string[] {
  // JSON dosyasının yolu
  const filePath = path.join(process.cwd(), "src", "data", "bannedWords.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function validateTextField(text: string, bannedWords: string[], options?: { requireTurkishWord?: boolean, minLen?: number, maxLen?: number }): { valid: boolean, error?: string } {
  if (!text) return { valid: false, error: "Alan boş olamaz." };
  const minLen = options?.minLen ?? 3;
  const maxLen = options?.maxLen ?? 100;
  if (text.length < minLen || text.length > maxLen) {
    return { valid: false, error: `Alan ${minLen} ile ${maxLen} karakter arasında olmalıdır.` };
  }
  // Satır sonu ve tab karakterlerini de izin verilenlere ekle
  const allowedRegex = /^[a-zA-ZğüşöçıİĞÜŞÖÇ0-9 ,.'"!?()\-\n\r\t]+$/;
  if (!allowedRegex.test(text)) {
    // İlk hatalı karakteri bul
    const invalidChar = text.split('').find(c => !/[a-zA-ZğüşöçıİĞÜŞÖÇ0-9 ,.'"!?()\-\n\r\t]/.test(c));
    return { valid: false, error: `Alana sadece harf, rakam ve temel noktalama işaretleri girilebilir. Hatalı karakter: '${invalidChar ?? '?'}'` };
  }
  // Spam & tekrar eden harf kontrolü
  if (hasRepeatingChars(text)) {
    return { valid: false, error: "Aynı harf veya karakter üçten fazla tekrar edemez." };
  }
  if (allCharsSame(text.replace(/\s/g, ''))) {
    return { valid: false, error: "Metin farklı karakterlerden oluşmalıdır." };
  }
  if (hasKeyboardPattern(text)) {
    return { valid: false, error: "Anlamsız dizi tespit edildi." };
  }
  // Yasaklı kelime kontrolü
  const lower = text.toLocaleLowerCase("tr-TR");
  for (const banned of bannedWords) {
    if (lower.includes(banned)) {
      return { valid: false, error: "Uygunsuz kelime tespit edildi." };
    }
  }

  return { valid: true };
}

export function isNameValid(name: string, bannedWords: string[]): { valid: boolean, error?: string } {
  if (!name) return { valid: false, error: "Ad soyad boş olamaz." };

  // Sadece harf ve boşluk izin ver
  if (!/^[a-zA-ZğüşöçıİĞÜŞÖÇ ]+$/.test(name)) {
    return { valid: false, error: "Ad soyad sadece harflerden oluşmalıdır." };
  }

  // Kelime sayısı kontrolü
  const words = name.trim().split(/\s+/);
  if (!(words.length === 2 || words.length === 3)) {
    return { valid: false, error: "Ad soyad 2 veya 3 kelimeden oluşmalıdır." };
  }

  // Her kelime en az 2 harfli olmalı
  if (words.some(w => w.length < 2 || w.length > 20)) {
    return { valid: false, error: "Her kelime en az 2, en fazla 20 harfli olmalıdır." };
  }

  // Ad ve soyad aynı olmamalı
  if (words.length >= 2 && words[0].toLocaleLowerCase("tr-TR") === words[1].toLocaleLowerCase("tr-TR")) {
    return { valid: false, error: "Ad ve soyad aynı olamaz." };
  }

  // Her kelime başı büyük harf, geri kalanı küçük harf olmalı
  if (!isProperNameFormat(name)) {
    return { valid: false, error: "Her kelime baş harfi büyük, devamı küçük harf olmalıdır (örn: Ali Veli)." };
  }

  // Tüm harfler aynıysa
  if (words.some(w => allCharsSame(w))) {
    return { valid: false, error: "Her kelime farklı harflerden oluşmalıdır." };
  }

  // Çok fazla tekrar eden harf varsa
  if (words.some(w => hasRepeatingChars(w))) {
    return { valid: false, error: "Aynı harf bir kelimede üçten fazla tekrar edemez." };
  }

  // Klavye dizileri veya anlamsız örüntüler varsa
  if (words.some(w => hasKeyboardPattern(w))) {
    return { valid: false, error: "Geçersiz isim formatı: Anlamsız dizi tespit edildi." };
  }

  // Yasaklı kelime kontrolü (küçük harfe çevirip bak)
  const lowerName = name.toLocaleLowerCase("tr-TR");
  for (const banned of bannedWords) {
    if (lowerName.includes(banned)) {
      return { valid: false, error: "Ad soyadda uygunsuz kelime kullanılamaz." };
    }
  }



  // Normal bir isme benziyor mu? (tüm kelimeler harf, çok kısa/uzun değil)
  if (name.length < 5 || name.length > 50) {
    return { valid: false, error: "Ad soyad çok kısa veya çok uzun." };
  }

  return { valid: true };
}
