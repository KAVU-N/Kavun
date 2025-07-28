import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { containsProhibited, isValidLinkedInUrl } from '@/lib/contentFilter';
import Project from '@/models/Project';

// Tek proje getir
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    // Görüntülenme sayısını artırarak projeyi getir
    const project = await (Project as any).findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!project) return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Project fetch error:', error);
    return NextResponse.json({ error: error.message || 'Hata' }, { status: 500 });
  }
}

// Proje güncelle veya sil (PATCH & DELETE)
// Proje güncelle (sadece proje sahibi)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı kimliği gereklidir' }, { status: 400 });
    }

    // İçerik güvenlik kontrolü
    const checkFields = [updates.title, updates.description, updates.requirements, updates.benefits, updates.position];
    if (updates.linkedinUrl && !isValidLinkedInUrl(updates.linkedinUrl)) {
      return NextResponse.json({ error: 'LinkedIn URL geçersiz' }, { status: 400 });
    }

    if (checkFields.some((f: string) => containsProhibited(f))) {
      return NextResponse.json({ error: 'Uygunsuz içerik tespit edildi' }, { status: 400 });
    }

    // Proje sahibini kontrol et
    const existing = await (Project as any).findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
    }
    if (existing.ownerId?.toString() !== userId) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz bulunmamaktadır' }, { status: 403 });
    }
    // ownerId alanının güncellenmesini engelle
    delete (updates as any).ownerId;

    const updated = await (Project as any).findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Project update error:', error);
    return NextResponse.json({ error: error.message || 'Güncellenemedi' }, { status: 500 });
  }
}

// Proje sil (sadece proje sahibi)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    // URL'den kullanıcı kimliğini al
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı kimliği gereklidir' }, { status: 400 });
    }

    const existing = await (Project as any).findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
    }
    if (existing.ownerId?.toString() !== userId) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz bulunmamaktadır' }, { status: 403 });
    }

    const deleted = await (Project as any).findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Project delete error:', error);
    return NextResponse.json({ error: error.message || 'Silinemedi' }, { status: 500 });
  }
}
