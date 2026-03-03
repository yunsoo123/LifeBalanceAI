import OpenAI from 'openai';
import { z } from 'zod';

const InsightsResponseSchema = z.object({
  insights: z.array(z.string()).default([]),
});

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      stats?: {
        planned_hours?: number;
        actual_hours?: number;
        completed_events?: number;
        total_events?: number;
        notes_created?: number;
        achievement_rate?: number;
        week_start?: string;
        week_end?: string;
      };
      locale?: 'ko' | 'en';
    };
    const { stats, locale = 'ko' } = body;

    if (!stats) {
      return Response.json({ error: 'Statistics data is required' }, { status: 400 });
    }

    const planned = stats.planned_hours ?? 0;
    const actual = stats.actual_hours ?? 0;
    const completedEvents = stats.completed_events ?? 0;
    const totalEvents = stats.total_events ?? 0;
    const hoursRatio = planned > 0 ? actual / planned : 0;

    const langInstruction =
      locale === 'ko'
        ? 'You MUST respond in Korean only. Every item in the "insights" array must be written in Korean.'
        : 'Respond in English.';

    const prompt = `You are a productivity coach analyzing a user's weekly performance. Provide 4-6 personalized insights and recommendations.

${langInstruction}

Weekly Statistics:
- Planned Hours: ${planned}h
- Actual Hours: ${actual}h (${Math.round(hoursRatio * 100)}% of plan)
- Events Completed: ${completedEvents}/${totalEvents}
- Notes Created: ${stats.notes_created ?? 0}
- Overall Achievement Rate: ${stats.achievement_rate ?? 0}%
- Week: ${stats.week_start ? new Date(stats.week_start).toLocaleDateString() : 'N/A'} to ${stats.week_end ? new Date(stats.week_end).toLocaleDateString() : 'N/A'}

Provide insights covering:
1. Overall performance assessment (positive and encouraging)
2. Time management analysis
3. Specific strengths to celebrate
4. Areas for improvement (constructive, not critical)
5. Actionable recommendations for next week
6. Motivation and encouragement

Keep each insight concise (1-2 sentences). Be supportive and practical. Focus on sustainable habits, not perfection.

Respond in JSON format:
{
  "insights": [
    "Insight 1...",
    "Insight 2...",
    "..."
  ]
}`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a supportive productivity coach helping people with ADHD manage their time better. Always be encouraging, practical, and non-judgmental. Focus on progress, not perfection.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 800,
    });

    const rawContent = completion.choices[0]?.message?.content;
    let insights: string[] = [];
    if (rawContent) {
      try {
        const json = JSON.parse(rawContent) as unknown;
        insights = InsightsResponseSchema.parse(json).insights;
      } catch {
        console.warn('Insights API: invalid JSON from AI, using empty insights');
      }
    }
    const tokensUsed = completion.usage?.total_tokens ?? 0;
    if (tokensUsed > 0) {
      // eslint-disable-next-line no-console -- cost tracking per .cursorrules
      console.info('AI insights', {
        provider: 'openai',
        model: 'gpt-4o-mini',
        total_tokens: tokensUsed,
      });
    }

    return Response.json({
      insights,
      tokensUsed,
    });
  } catch (error) {
    console.error('AI insights generation error:', error);
    return Response.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
