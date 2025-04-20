import { NextRequest, NextResponse } from 'next/server';

// Tüm kaynakları getir
export async function GET(request: NextRequest) {
  try {
    // localStorage'dan veri çekilemeyeceği için, istemci tarafında çalışacak bir API yanıtı dönüyoruz
    // Bu, istemci tarafında localStorage'dan veri çekmek için kullanılacak
    return NextResponse.json({ success: true, message: 'localStorage' });
  } catch (error) {
    console.error('Kaynaklar getirilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynaklar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni kaynak ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Gerekli alanları kontrol et
    if (!data.title || !data.description || !data.category || !data.format) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    
    // Yeni kaynak oluşturuldu mesajı dön
    // Gerçek kaydetme işlemi istemci tarafında localStorage'a yapılacak
    return NextResponse.json({ 
      success: true, 
      message: 'localStorage',
      id: Date.now() // Benzersiz bir ID dön
    }, { status: 201 });
  } catch (error) {
    console.error('Kaynak oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
