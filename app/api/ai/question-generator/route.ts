import { NextResponse } from 'next/server';
import { detectLanguage, extractTextFromFile, generateQuestionsFromText } from '@/src/lib/ai-utils';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'INVALID_CONTENT_TYPE' }, { status: 400 });
    }

    const formData = await request.formData();
    const questionCountRaw = formData.get('questionCount');
    const questionTypeRaw = (formData.get('questionType') as string) || 'multipleChoice';
    const choiceCountRaw = formData.get('choiceCount');
    const prompt = String(formData.get('prompt') || '') ?? '';
    const manualText = String(formData.get('text') || '') ?? '';
    const file = formData.get('file');

    const questionCount = Number(questionCountRaw ?? 5);
    const questionType = questionTypeRaw === 'openEnded' ? 'openEnded' : 'multipleChoice';
    const choiceCount = choiceCountRaw ? Number(choiceCountRaw) : 4;
    if (!Number.isFinite(questionCount) || questionCount <= 0 || questionCount > 20) {
      return NextResponse.json({ error: 'INVALID_COUNT' }, { status: 400 });
    }
    if (questionType === 'multipleChoice') {
      if (!Number.isFinite(choiceCount) || choiceCount < 2 || choiceCount > 6) {
        return NextResponse.json({ error: 'INVALID_CHOICE_COUNT' }, { status: 400 });
      }
    }

    let collectedText = manualText.trim();

    if (file instanceof File && file.size > 0) {
      const extracted = await extractTextFromFile(file);
      collectedText = `${collectedText}\n\n${extracted}`.trim();
    }

    if (!collectedText) {
      return NextResponse.json({ error: 'MISSING_SOURCE' }, { status: 400 });
    }

    const questions = await generateQuestionsFromText({
      text: collectedText,
      questionCount,
      prompt,
      questionType,
      choiceCount,
      language: detectLanguage(collectedText, formData.get('language') as string | null),
    });

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('[AI_QUESTION_GENERATOR]', error);
    const message = error?.message || 'Unknown error';
    return NextResponse.json({ error: 'PROCESSING_FAILED', message }, { status: 500 });
  }
}
