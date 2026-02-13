import OpenAI from 'openai';
import { z } from 'zod';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey });
}

// Output schema
const ScheduleSchema = z.object({
  activities: z.array(
    z.object({
      name: z.string(),
      hoursPerWeek: z.number(),
      optimalTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
    })
  ),
  totalHours: z.number(),
  feasible: z.boolean(),
  suggestions: z.array(z.string()),
});

export type Schedule = z.infer<typeof ScheduleSchema>;

export async function generateSchedule(userInput: string): Promise<Schedule> {
  const prompt = `You are a realistic life coach. User wants: "${userInput}"

Consider: (1) How many hours per week they can dedicate (excluding sleep, meals, commute). (2) Fixed commitments (work, school). (3) Energy pattern (morning person / night owl).

Generate a realistic weekly schedule. Total hours must be ≤100 (168 - 56 sleep - 12 meals).

Output only valid JSON in this exact shape:
{
  "activities": [{"name": "App Dev", "hoursPerWeek": 15, "optimalTime": "afternoon"}],
  "totalHours": 45,
  "feasible": true,
  "suggestions": ["Consider X", "Try Y"]
}`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  const json = JSON.parse(content) as unknown;
  return ScheduleSchema.parse(json);
}
