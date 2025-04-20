import { NextRequest, NextResponse } from 'next/server';

// Belirli bir kaynağı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // localStorage'dan veri çekilemeyeceği için, istemci tarafında çalışacak bir API yanıtı dönüyoruz
    // Bu, istemci tarafında localStorage'dan veri çekmek için kullanılacak
    return NextResponse.json({ 
      success: true, 
      message: 'localStorage',
      id: id
    });
  } catch (error) {
    console.error('Kaynak getirilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kaynağı güncelle (indirme sayısını artır)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // localStorage'da güncelleme yapılamayacağı için, istemci tarafında çalışacak bir API yanıtı dönüyoruz
    // Bu, istemci tarafında localStorage'da güncelleme yapmak için kullanılacak
    return NextResponse.json({ 
      success: true, 
      message: 'localStorage',
      id: id,
      action: data.action
    });
  } catch (error) {
    console.error('Kaynak güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kaynak güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
