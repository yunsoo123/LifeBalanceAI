import { z } from 'zod';
import { generateSchedule } from '@/lib/ai/schedule-generator';

const GenerateBodySchema = z.object({
  userInput: z.string().min(1, 'userInput is required'),
});

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = GenerateBodySchema.safeParse(raw);
    if (!parsed.success) {
      const msg =
        parsed.error.issues.map((e: { message: string }) => e.message).join('; ') ||
        'Missing or invalid userInput';
      return Response.json({ error: msg }, { status: 400 });
    }
    const { userInput } = parsed.data;

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const schedule = await generateSchedule(userInput);
        return Response.json({ success: true, data: schedule });
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`Schedule generation attempt ${attempt + 1} failed:`, err);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    throw lastError ?? new Error('Failed after retries');
  } catch (error) {
    console.error('Schedule generation failed:', error);

    return Response.json(
      {
        error: '일정 생성에 실패했어요. 잠시 후 다시 시도해 주세요.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
