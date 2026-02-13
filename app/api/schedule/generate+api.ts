import { generateSchedule } from '@/lib/ai/schedule-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { userInput?: unknown };
    const { userInput } = body;

    if (!userInput || typeof userInput !== 'string') {
      return Response.json(
        { error: 'Missing or invalid userInput' },
        { status: 400 }
      );
    }

    const schedule = await generateSchedule(userInput);

    return Response.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Schedule generation failed:', error);

    return Response.json(
      {
        error: 'Failed to generate schedule. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
