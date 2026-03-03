import OpenAI from 'openai';
import { z } from 'zod';

/** 0=Mon, 1=Tue, ... 6=Sun (week starts Monday) */
export const ParsedScheduleEventSchema = z.object({
  title: z.string(),
  days: z.array(z.number().min(0).max(6)).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  durationHours: z.number().optional(),
  recurring: z.boolean().optional(),
});

export type ParsedScheduleEvent = z.infer<typeof ParsedScheduleEventSchema>;

const ResponseSchema = z.object({
  events: z.array(ParsedScheduleEventSchema),
});

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey });
}

/**
 * Parse one-line natural language into 1+ schedule events.
 * Example: "학교 월수금 9-1시, 알바 화목 18시 4시간" or "내일 미팅 2시간"
 */
export async function parseScheduleFromText(text: string): Promise<ParsedScheduleEvent[]> {
  const prompt = `Parse this one-line schedule description into 1 or more calendar events. Use Korean or English as in the input.

Input: "${text}"

Rules:
- days: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday. Omit if "every day" or flexible.
- startTime/endTime: "HH:mm" 24h format when fixed (e.g. "09:00", "13:00").
- durationHours: number when duration is given (e.g. 4, 2).
- recurring: true if repeats weekly.
- Extract at least 1 event. For multiple items in one line, split into multiple events (e.g. "학교 월수금 9-1시, 알바 화목 4시간" → 2 events). For a single item, output 1 event.`;

  const promptSuffix = `

Output JSON only:
{
  "events": [
    { "title": "...", "days": [...], "startTime": "HH:mm", "endTime": "HH:mm", "durationHours": N, "recurring": true/false }
  ]
}`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You output only valid JSON with an "events" array. Each event has title (string), optional days (0-6), startTime, endTime (HH:mm), durationHours (number), recurring (boolean).',
      },
      { role: 'user', content: prompt + promptSuffix },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No content from OpenAI');

  if (response.usage) {
    console.info('[parse-schedule] usage', {
      model: 'gpt-4o-mini',
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
    });
  }

  const raw = JSON.parse(content) as unknown;
  const parsed = ResponseSchema.parse(raw);
  if (parsed.events.length < 1) {
    throw new Error('At least 1 event required');
  }
  return parsed.events;
}
