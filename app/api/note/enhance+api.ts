import OpenAI from 'openai';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: string; content?: string };
    const { title = '', content } = body;

    if (!content || content.trim().length === 0) {
      return Response.json({ error: 'Note content is required' }, { status: 400 });
    }

    const prompt = `Analyze the following note and provide:
1. A brief summary (1-2 sentences)
2. 3-5 actionable items extracted from the content
3. 2-3 suggestions to improve or expand the note

Note Title: ${title}
Note Content: ${content}

Respond in JSON format:
{
  "summary": "...",
  "actionItems": ["...", "..."],
  "improvements": ["...", "..."]
}`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that analyzes notes and provides actionable insights. Always respond with valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const rawContent = completion.choices[0]?.message?.content;
    const suggestions = rawContent ? (JSON.parse(rawContent) as Record<string, unknown>) : {};

    return Response.json({
      suggestions,
      tokensUsed: completion.usage?.total_tokens ?? 0,
    });
  } catch (error) {
    console.error('AI enhancement error:', error);
    return Response.json({ error: 'Failed to generate AI suggestions' }, { status: 500 });
  }
}
