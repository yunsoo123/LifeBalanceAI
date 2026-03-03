import { z } from 'zod';
import { parseScheduleFromText } from '@/lib/ai/parse-schedule';
import { ParsedScheduleEventSchema } from '@/lib/ai/parse-schedule';

const BodySchema = z.object({
  text: z.string().min(1, 'text is required'),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      const msg =
        parsed.error.issues.map((e: { message: string }) => e.message).join('; ') ||
        'Missing or invalid text';
      return Response.json({ error: msg }, { status: 400 });
    }
    const { text } = parsed.data;

    const events = await parseScheduleFromText(text);

    if (events.length < 1) {
      return Response.json({ error: '이 내용으로는 일정을 만들 수 없어요.' }, { status: 400 });
    }

    const validated = z.array(ParsedScheduleEventSchema).parse(events);
    return Response.json({ events: validated });
  } catch (error) {
    console.error('Parse schedule failed:', error);
    return Response.json({ error: '일정 파싱에 실패했어요. 다시 입력해 주세요.' }, { status: 500 });
  }
}
