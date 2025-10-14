import { Buffer } from 'node:buffer';

const MAX_TEXT_LENGTH = 8000;

export interface GeneratedQuestionResult {
  question: string;
  choices?: string[];
  answerIndex?: number;
  answer?: string;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = (file.name?.split('.').pop() || '').toLowerCase();
  const mimeType = file.type;

  if (extension === 'pdf' || mimeType === 'application/pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    return truncateText(result.text || '');
  }

  if (extension === 'docx' || extension === 'doc' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth');
    const { value } = await mammoth.extractRawText({ buffer });
    return truncateText(value || '');
  }

  if (extension === 'txt' || mimeType === 'text/plain') {
    return truncateText(buffer.toString('utf-8'));
  }

  // Fallback: try to interpret as UTF-8 text
  return truncateText(buffer.toString('utf-8'));
}

export async function generateQuestionsFromText({
  text,
  questionCount,
  prompt,
  questionType,
  choiceCount,
  language,
}: {
  text: string;
  questionCount: number;
  prompt: string;
  questionType: 'multipleChoice' | 'openEnded';
  choiceCount: number;
  language: 'tr' | 'en';
}): Promise<GeneratedQuestionResult[]> {
  const systemPrompt = `You are an experienced teacher creating high quality assessment questions.
Return your answer strictly as JSON matching this TypeScript type:
type Question = { question: string; choices?: string[]; answerIndex?: number; answer?: string };
type Payload = { questions: Question[] };
Do not include markdown, explanations, or additional keys.
Always write in ${language === 'en' ? 'English' : 'Turkish'}.`;

  const typeInstruction =
    questionType === 'multipleChoice'
      ? `Create multiple-choice questions. Each item must include exactly ${choiceCount} answer choices. Provide the choices as plain text strings in the "choices" array without letter prefixes. Set "answerIndex" to the zero-based index of the correct choice.`
      : 'Create open-ended questions that prompt detailed written responses. Include a concise model answer in the "answer" field.';

  const userPrompt = `Source content:\n\n${text}\n\nAdditional instructions: ${
    prompt || 'Generate diverse questions.'
  }\n\nQuestion count: ${questionCount}\nQuestion format instructions: ${typeInstruction}`;

  const completion = await createChatCompletion({
    systemPrompt,
    userPrompt,
  });

  return parseQuestionResults(completion, questionCount, questionType);
}

export async function generateNotesFromText({
  text,
  prompt,
  tone,
  language,
}: {
  text: string;
  prompt: string;
  tone: 'academic' | 'simple';
  language: 'tr' | 'en';
}): Promise<string[]> {
  const systemPrompt = `You are an expert academic note-taker. Produce concise bullet-point study notes tailored to the requested tone.
Always respond in ${language === 'en' ? 'English' : 'Turkish'}.
Return clear, complete sentences that capture the essential ideas.
Begin each note with "- " and DO NOT wrap the response in JSON, XML, or code blocks.`;

  const toneLabel = tone === 'academic' ? 'academic (formal, technical)' : 'simple (plain language)';

  const userPrompt = `Source content:\n\n${text}\n\nAdditional instructions: ${prompt || 'Emphasize the key ideas.'}\n\nTone: ${toneLabel}`;

  const completion = await createChatCompletion({
    systemPrompt,
    userPrompt,
  });

  return parseNotes(completion);
}

async function createChatCompletion({
  systemPrompt,
  userPrompt,
}: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in .env.local.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorPayload}`);
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI response did not include any content.');
  }

  return content.trim();
}

function parseQuestionResults(
  content: string,
  questionCount: number,
  questionType: 'multipleChoice' | 'openEnded',
): GeneratedQuestionResult[] {
  const parsed = safeJsonParse(content);
  if (parsed && Array.isArray(parsed.questions)) {
    return parsed.questions
      .slice(0, questionCount)
      .map((item: any) => {
        const question = typeof item?.question === 'string' ? item.question.trim() : '';
        if (!question) {
          return undefined;
        }

        const choices = Array.isArray(item?.choices)
          ? item.choices
              .map((choice: any) => (typeof choice === 'string' ? choice.trim() : String(choice || '')))
              .filter((choice: string) => Boolean(choice))
          : undefined;

        const rawAnswerIndex = item?.answerIndex;
        const answerIndex =
          typeof rawAnswerIndex === 'number' && Number.isInteger(rawAnswerIndex) ? rawAnswerIndex : undefined;

        const answer = typeof item?.answer === 'string' ? item.answer.trim() : undefined;

        return {
          question,
          choices,
          answerIndex,
          answer,
        } satisfies GeneratedQuestionResult;
      })
      .filter(Boolean) as GeneratedQuestionResult[];
  }

  const fallbackBlocks = normalizeStringArray(
    content
      .split(/\n{2,}/)
      .map((block) => block.replace(/^[-*\d.\)\s]+/, '').trim())
      .filter(Boolean),
    questionCount,
  );

  return fallbackBlocks.map((question) => ({ question })) as GeneratedQuestionResult[];
}

function parseNotes(content: string): string[] {
  const parsed = safeJsonParse(content);
  if (parsed && Array.isArray(parsed.notes)) {
    return normalizeStringArray(parsed.notes);
  }

  const lines = content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s*/, ''));

  if (lines.length > 0) {
    return lines;
  }

  return [content.trim()].filter(Boolean);
}

function safeJsonParse(content: string): any {
  try {
    return JSON.parse(content);
  } catch (error) {
    return undefined;
  }
}

function normalizeStringArray(values: string[], limit?: number): string[] {
  const cleaned = values
    .map((value) => (typeof value === 'string' ? value.trim() : String(value)))
    .filter(Boolean);

  if (typeof limit === 'number') {
    return cleaned.slice(0, limit);
  }

  return cleaned;
}

function truncateText(text: string): string {
  if (!text) return '';
  if (text.length <= MAX_TEXT_LENGTH) return text;
  return `${text.slice(0, MAX_TEXT_LENGTH)}...`;
}

export function detectLanguage(text: string, preferred: string | null | undefined): 'tr' | 'en' {
  if (preferred === 'tr' || preferred === 'en') {
    return preferred;
  }

  const turkishCharacters = /[çğıöşüÇĞİÖŞÜ]/;
  if (turkishCharacters.test(text)) {
    return 'tr';
  }

  return 'en';
}
