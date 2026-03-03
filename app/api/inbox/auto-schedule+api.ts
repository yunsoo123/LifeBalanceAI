import { z } from 'zod';
import { ParsedScheduleEventSchema } from '@/lib/ai/parse-schedule';
import { placeParsedEvents } from '@/lib/autoSchedulePlacement';

const BodySchema = z.object({
  parsedEvents: z.array(ParsedScheduleEventSchema).min(1, 'parsedEvents is required'),
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      const msg =
        parsed.error.issues.map((e: { message: string }) => e.message).join('; ') ||
        'Missing or invalid parsedEvents';
      return Response.json({ error: msg }, { status: 400 });
    }
    const { parsedEvents, weekStart } = parsed.data;

    const eventsToCreate = placeParsedEvents(parsedEvents, weekStart);

    return Response.json({
      eventsToCreate,
    });
  } catch (error) {
    console.error('Auto-schedule placement failed:', error);
    return Response.json({ error: '일정 배치에 실패했어요. 다시 시도해 주세요.' }, { status: 500 });
  }
}
