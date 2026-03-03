import OpenAI from 'openai';
import { z } from 'zod';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey });
}

/** 0=Mon, 1=Tue, ... 6=Sun (app convention). Used when user specifies a day (e.g. "금요일 오전만"). */
/** preferredStartMinutes: 0..1440 (minutes from midnight). e.g. 540 = 9:00. */
const ScheduleSchema = z.object({
  activities: z.array(
    z.object({
      name: z.string(),
      hoursPerWeek: z.number(),
      optimalTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
      preferredDayOfWeek: z.number().min(0).max(6).optional(),
      preferredStartMinutes: z.number().min(0).max(1440).optional(),
    })
  ),
  totalHours: z.number(),
  feasible: z.boolean(),
  suggestions: z.array(z.string()),
});

export type Schedule = z.infer<typeof ScheduleSchema>;

export async function generateSchedule(userInput: string): Promise<Schedule> {
  const prompt = `You are a realistic life coach. The user's goal (they may write in Korean or English): "${userInput}"

Consider: (1) How many hours per week they can dedicate (excluding sleep, meals, commute). (2) Fixed commitments (work, school). (3) Energy pattern (morning person / night owl).

Generate a realistic weekly schedule. Total hours must be ≤100 (168 - 56 sleep - 12 meals).

IMPORTANT: You MUST respond in Korean only. All "name" values in activities and all "suggestions" must be written in Korean.

Output only valid JSON in this exact shape:
{
  "activities": [{"name": "앱 개발", "hoursPerWeek": 15, "optimalTime": "afternoon"}],
  "totalHours": 45,
  "feasible": true,
  "suggestions": ["오전에 집중 일과를 넣어보세요.", "휴식 시간을 주간에 분산하세요."]
}

optimalTime must be exactly one of: "morning", "afternoon", "evening", "flexible".`;

  const maxAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      const usage = response.usage;
      if (usage?.total_tokens && process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console -- cost tracking per .cursorrules
        console.info('AI schedule', {
          provider: 'openai',
          model: 'gpt-4o-mini',
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        });
      }

      const json = JSON.parse(content) as unknown;
      return ScheduleSchema.parse(json);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }
  }

  throw lastError ?? new Error('Failed to generate schedule');
}

// --- Multi-turn chat: question or schedule ---
const MAX_CHAT_TURNS = 6;

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

function buildSystemPrompt(todayLabel: string): string {
  return `You are a friendly life coach for "Mendly" (일정 관리 앱). You help users build a realistic weekly schedule.

**오늘 날짜 (기준):** ${todayLabel}
- 사용자가 "내일", "모레", "낼", "금요일", "다음 주 월요일" 등으로 말하면 위 날짜를 기준으로 요일과 날짜를 추론하세요.
- 이미 대화에서 요일이나 상대 날짜가 드러났으면 요일을 다시 묻지 마세요. (예: "낼 현수랑 약속" + "저녁 7시"만으로 금요일 19시로 정하고 JSON에 반영하세요.)

Rules:
1. Respond ONLY in Korean.
2. If you need more information to build a realistic schedule, ask ONE short clarifying question (e.g. 알바 요일/시간, 수면 시간, 고정 일정).
3. If you have enough information (goals, fixed commitments, sleep preference, preferred times), output ONLY a valid JSON object with no other text.
4. Total hours must be ≤ 168 per week; account for sleep (e.g. 56h) and meals. Set feasible to false if overcommitted.
5. optimalTime must be exactly one of: morning, afternoon, evening, flexible.
6. Ask at most 2–3 questions total; then produce the schedule.

When the user specifies a day and/or time for an activity (e.g. "금요일 오전만", "Friday morning only", "월요일 9시", "내일 저녁 7시"), set for that activity:
- preferredDayOfWeek: 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일. Example: 금요일 → 4.
- preferredStartMinutes: minutes from midnight (0–1440). Example: 9:00 → 540, 19:00 → 1140.

JSON shape (optional fields only when user specified day/time):
{"activities":[{"name":"string","hoursPerWeek":number,"optimalTime":"morning|afternoon|evening|flexible","preferredDayOfWeek":0-6,"preferredStartMinutes":0-1440}],"totalHours":number,"feasible":true|false,"suggestions":["string"]}`;
}

export type ScheduleChatMessage = { role: 'user' | 'assistant'; content: string };

export type ScheduleChatResponse =
  | { type: 'question'; content: string }
  | { type: 'schedule'; data: Schedule };

export async function scheduleChat(
  messages: ScheduleChatMessage[],
  options?: { today?: string }
): Promise<ScheduleChatResponse> {
  if (messages.length === 0 || messages.length > MAX_CHAT_TURNS * 2) {
    return {
      type: 'question',
      content:
        '이번 주에 하고 싶은 일을 한 줄로 적어 주세요. (예: 앱 개발, 알바, 수업)',
    };
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dayOfWeek = now.getDay();
  const todayLabel =
    options?.today ?? `${y}-${m}-${d} (${WEEKDAY_KO[dayOfWeek]}요일)`;

  const openai = getOpenAI();
  const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt(todayLabel) },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: apiMessages,
    temperature: 0.5,
    max_tokens: 1200,
  });

  const content = response.choices[0]?.message?.content?.trim() ?? '';
  if (!content) {
    return {
      type: 'question',
      content: '다시 한 줄로 편하게 적어 주세요.',
    };
  }

  const usage = response.usage;
  if (usage?.total_tokens && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console -- cost tracking
    console.info('AI schedule chat', {
      provider: 'openai',
      model: 'gpt-4o-mini',
      total_tokens: usage.total_tokens,
    });
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const json = JSON.parse(jsonMatch[0]) as unknown;
      const schedule = ScheduleSchema.parse(json);
      return { type: 'schedule', data: schedule };
    } catch {
      // Fall through to treat as question
    }
  }

  return { type: 'question', content };
}
