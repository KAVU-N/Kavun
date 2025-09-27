const fs = require('fs');
const path = require('path');

const target = path.resolve('d:/Kavunla/Kavun/src/components/Navbar.tsx');

let content = fs.readFileSync(target, 'utf8');

// 1) Tüm merge işaretlerini kaldır
content = content.replace(/^(<<<<<<<|=======|>>>>>>>).*\r?\n/gm, '');

// 2) "derslerim" -> "ilanlarim"
content = content.replace(/href=\"\/derslerim\"/g, 'href="/ilanlarim"');

// 3) Görünen metinleri i18n'e çevir
content = content.replace(/<span>İlanlarım<\/span>/g, "<span>{t('nav.myListings')}</span>");
content = content.replace(/<span>Derslerim<\/span>/g, "<span>{t('nav.myListings')}</span>");
content = content.replace(/\{t\('nav.myLessons'\)\}/g, "{t('nav.myListings')}");

// 4) Rol bazlı ikinci "İlanlarım" bloğunu kaldır
// Desen: {user && (typedUser?.role ... ) && (  ...  )}
content = content.replace(/\n\s*\{user\s*&&\s*\(typedUser\?\.[\s\S]*?\n\s*\)\}\s*\)\}\s*\n/g, '\n');
// Bazı varyantlar için daha esnek kapanış yakala (satırın yalnızca ")}" olduğu durum)
content = content.replace(/\n\s*\{user\s*&&\s*\(typedUser\?\.[\s\S]*?\n\s*\)\}\s*\n/g, '\n');

// 5) Mobil menüde kalan "derslerim" metnini de i18n'e çevir (varsa)
content = content.replace(/<span>\{t\('nav.myLessons'\)\}<\/span>/g, "<span>{t('nav.myListings')}</span>");

fs.writeFileSync(target, content, 'utf8');

console.log('fixNavbarConflicts: completed');
