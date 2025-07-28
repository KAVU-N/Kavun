import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { containsProhibited, isValidLinkedInUrl } from '@/lib/contentFilter';
import Project from '@/models/Project';

// Tüm projeleri getir
export async function GET(request: Request) {
  try {
    await connectDB();
    
        // İsteğin query parametrelerinden userId al
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const filter: any = {};
    if (userId) filter.ownerId = userId;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 }) // En yeni projeler önce
      .select('title description category position imageUrl projectUrl technologies status views ownerId');
    
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { error: 'Projeler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni proje ekle
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    // Basit içerik güvenlik kontrolü
    const fieldsToCheck = [body.title, body.description, body.requirements, body.benefits, body.position];
    if (body.linkedinUrl && !isValidLinkedInUrl(body.linkedinUrl)) {
      return NextResponse.json({ error: 'LinkedIn URL geçersiz' }, { status: 400 });
    }

    if (fieldsToCheck.some((f: string) => containsProhibited(f))) {
      return NextResponse.json({ error: 'Uygunsuz içerik tespit edildi' }, { status: 400 });
    }

    const project = await Project.create(body);
    
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Proje oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}