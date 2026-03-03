import { z } from 'zod';
import { scheduleChat } from '@/lib/ai/schedule-generator';

const ChatBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = ChatBodySchema.safeParse(raw);
    if (!parsed.success) {
      const msg =
        parsed.error.issues.map((e: { message: string }) => e.message).join('; ') ||
        'Invalid request body';
      return Response.json({ error: msg }, { status: 400 });
    }
    const { messages } = parsed.data;

    const result = await scheduleChat(messages);
    return Response.json(result);
  } catch (error) {
    console.error('Schedule chat failed:', error);
    return Response.json(
      {
        error: '일정 대화에 실패했어요. 잠시 후 다시 시도해 주세요.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
