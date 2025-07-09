import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { containsProhibited, isValidLinkedInUrl } from '@/lib/contentFilter';
import Project from '@/models/Project';

// Tek proje getir
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const project = await (Project as any).findById(params.id);
    if (!project) return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Project fetch error:', error);
    return NextResponse.json({ error: error.message || 'Hata' }, { status: 500 });
  }
}

// Proje güncelle veya sil (PATCH & DELETE)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const updates = await request.json();

    // İçerik güvenlik kontrolü
    const checkFields = [updates.title, updates.description, updates.requirements, updates.benefits];
    if (updates.linkedinUrl && !isValidLinkedInUrl(updates.linkedinUrl)) {
      return NextResponse.json({ error: 'LinkedIn URL geçersiz' }, { status: 400 });
    }

    if (checkFields.some((f: string) => containsProhibited(f))) {
      return NextResponse.json({ error: 'Uygunsuz içerik tespit edildi' }, { status: 400 });
    }

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

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
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
