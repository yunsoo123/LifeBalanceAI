import { z } from 'zod';
import { parseNote } from '@/lib/ai/note-parser';

const ParseBodySchema = z.object({
  rawText: z.string().min(1, 'rawText is required'),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = ParseBodySchema.safeParse(raw);
    if (!parsed.success) {
      const msg =
        parsed.error.issues.map((e: { message: string }) => e.message).join('; ') ||
        'Missing or invalid rawText';
      return Response.json({ error: msg }, { status: 400 });
    }
    const { rawText } = parsed.data;

    const parsedNote = await parseNote(rawText);

    return Response.json({
      success: true,
      data: parsedNote,
    });
  } catch (error) {
    console.error('Note parsing failed:', error);

    return Response.json(
      {
        error: 'Failed to parse note. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
