import OpenAI from 'openai';
import { z } from 'zod';

const BodySchema = z.object({
  goalVsActual: z.array(
    z.object({
      goalName: z.string(),
      plannedHours: z.number(),
      actualHours: z.number(),
      percent: z.number(),
    })
  ),
  overBudget: z.array(z.object({ name: z.string(), overHours: z.number() })).default([]),
  locale: z.enum(['ko', 'en']).default('ko'),
});

const ResponseSchema = z.object({
  suggestion: z.string(),
});

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goalVsActual, overBudget, locale } = BodySchema.parse(body);

    const langInstruction =
      locale === 'ko'
        ? 'You MUST respond in Korean only. One short paragraph (1-2 sentences).'
        : 'Respond in English. One short paragraph (1-2 sentences).';

    const lines = goalVsActual.map(
      (g) => `- ${g.goalName}: ${g.actualHours}h / ${g.plannedHours}h (${g.percent}%)`
    );
    const overLines =
      overBudget.length > 0
        ? `\nOver budget: ${overBudget.map((o) => `${o.name} (+${o.overHours}h)`).join(', ')}`
        : '';

    const prompt = `You are a productivity coach. Based on this week's goal vs actual, suggest ONE concrete change for next week (e.g. limit one activity, increase another). Be encouraging and specific.

${langInstruction}

This week:
${lines.join('\n')}${overLines}

Respond with a single suggestion in this style: "다음 주에는 [activity] 시간을 [X]시간으로 제한하고, [other] 시간을 [Y]시간으로 늘리는 건 어떨까요?" (or English equivalent). No bullet points, just one paragraph.

Respond in JSON: { "suggestion": "your one paragraph here" }`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a supportive productivity coach. Output only valid JSON with a "suggestion" key. One short, actionable suggestion for next week.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 300,
    });

    const rawContent = completion.choices[0]?.message?.content;
    let suggestion = '';
    if (rawContent) {
      try {
        const json = JSON.parse(rawContent) as unknown;
        suggestion = ResponseSchema.parse(json).suggestion;
      } catch {
        suggestion =
          locale === 'ko'
            ? '다음 주에는 목표를 조금 조정해 보는 건 어떨까요?'
            : 'Consider adjusting your goals a bit for next week.';
      }
    }

    return Response.json({ suggestion });
  } catch (error) {
    console.error('Next week suggestion error:', error);
    return Response.json({ error: 'Failed to generate suggestion' }, { status: 500 });
  }
}
