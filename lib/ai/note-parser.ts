import OpenAI from 'openai';
import { z } from 'zod';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  return new OpenAI({ apiKey });
}

// Output schema
const NoteSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  tasks: z.array(
    z.object({
      text: z.string(),
      done: z.boolean().default(false),
    })
  ),
  linkedEventNames: z.array(z.string()), // e.g. ["App Dev", "School"]
});

export type ParsedNote = z.infer<typeof NoteSchema>;

const MAX_ATTEMPTS = 3;

export async function parseNote(rawText: string): Promise<ParsedNote> {
  const prompt = `Parse this brain-dump text into structured note:

"${rawText}"

Extract:
1. Title (short, descriptive)
2. Tags (2-5 keywords, lowercase, kebab-case)
3. Tasks (checkbox items if mentioned)
4. Linked events (if text mentions activities like "app dev", "school", "poker")

Output JSON:
{
  "title": "App Dev Progress - Day 3",
  "tags": ["app-dev", "coding"],
  "tasks": [{"text": "Fix login bug", "done": false}],
  "linkedEventNames": ["App Dev"]
}`;

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      const usage = response.usage;
      if (usage?.total_tokens && process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console -- cost tracking per .cursorrules
        console.info('AI note parse', {
          provider: 'openai',
          model: 'gpt-4o-mini',
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        });
      }

      const json = JSON.parse(content) as unknown;
      return NoteSchema.parse(json);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 600 * attempt));
      }
    }
  }

  throw lastError ?? new Error('Failed to parse note');
}
