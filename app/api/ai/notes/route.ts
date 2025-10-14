import { NextResponse } from 'next/server';
import { detectLanguage, extractTextFromFile, generateNotesFromText } from '@/src/lib/ai-utils';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'INVALID_CONTENT_TYPE' }, { status: 400 });
    }

    const formData = await request.formData();
    const tone = (formData.get('tone') as 'academic' | 'simple') || 'academic';
    const prompt = String(formData.get('prompt') || '') ?? '';
    const manualText = String(formData.get('text') || '') ?? '';
    const file = formData.get('file');

    let collectedText = manualText.trim();

    if (file instanceof File && file.size > 0) {
      const extracted = await extractTextFromFile(file);
      collectedText = `${collectedText}\n\n${extracted}`.trim();
    }

    if (!collectedText) {
      return NextResponse.json({ error: 'MISSING_SOURCE' }, { status: 400 });
    }

    const notes = await generateNotesFromText({
      text: collectedText,
      prompt,
      tone,
      language: detectLanguage(collectedText, formData.get('language') as string | null),
    });

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error('[AI_NOTES]', error);
    const message = error?.message || 'Unknown error';
    return NextResponse.json({ error: 'PROCESSING_FAILED', message }, { status: 500 });
  }
}
