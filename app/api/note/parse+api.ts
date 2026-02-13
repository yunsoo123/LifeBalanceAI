import { parseNote } from '@/lib/ai/note-parser';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rawText?: unknown };
    const { rawText } = body;

    if (!rawText || typeof rawText !== 'string') {
      return Response.json(
        { error: 'Missing or invalid rawText' },
        { status: 400 }
      );
    }

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
