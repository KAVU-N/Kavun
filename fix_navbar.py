#!/usr/bin/env python3
import re

# Dosyayı oku
with open('src/components/Navbar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Line 437: href özelliği ekle
content = re.sub(
    r'(<Link\n\s+className="block px-4 py-2 text\[^"]+"\n\s+>)',
    r'\1href="/projelerim" ',
    content
)

# 2. Line 475: )} ekle
content = re.sub(
    r'(}\s*\)\s*;\s*})',
    r'\1)}',
    content
)

# 3. Line 476: } ekle
content = re.sub(
    r'(}\s*;\s*})',
    r'\1}',
    content
)

# 4. Line 477: </div> ekle
content = re.sub(
    r'(</nav>\s*</div>\s*)\);',
    r'\1</div>);',
    content
)

# 5. Line 480: } ekle
content = re.sub(
    r'(}\s*;\s*})',
    r'\1}',
    content
)

# 6. Line 487: return ( ekle
content = re.sub(
    r'(return\s+)\(',
    r'\1(',
    content
)

# 7. Line 513: } ekle
content = re.sub(
    r'(}\s*;\s*})',
    r'\1}',
    content
)

# 8. Line 521: } ekle
content = re.sub(
    r'(}\s*)$',
    r'\1}',
    content
)

# Dosyayı kaydet
with open('src/components/Navbar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dosya düzeltildi!")
