/**
 * 자연어 날짜 추출 (한글·영어). Quick Add에서 "내일", "tomorrow" 등 파싱.
 */
export interface ParsedNaturalDate {
  date: Date;
  restText: string;
}

const KO_PATTERNS: { pattern: RegExp; getDate: (base: Date) => Date }[] = [
  { pattern: /오늘\s*$/i, getDate: (d) => d },
  { pattern: /내일\s*$/i, getDate: (d) => addDays(d, 1) },
  { pattern: /모레\s*$/i, getDate: (d) => addDays(d, 2) },
  { pattern: /다음\s*주\s*월요일\s*$/i, getDate: (d) => nextWeekday(d, 1) },
  { pattern: /다음\s*주\s*화요일\s*$/i, getDate: (d) => nextWeekday(d, 2) },
  { pattern: /다음\s*주\s*수요일\s*$/i, getDate: (d) => nextWeekday(d, 3) },
  { pattern: /다음\s*주\s*목요일\s*$/i, getDate: (d) => nextWeekday(d, 4) },
  { pattern: /다음\s*주\s*금요일\s*$/i, getDate: (d) => nextWeekday(d, 5) },
  { pattern: /다음\s*주\s*토요일\s*$/i, getDate: (d) => nextWeekday(d, 6) },
  { pattern: /다음\s*주\s*일요일\s*$/i, getDate: (d) => nextWeekday(d, 0) },
  { pattern: /다음\s*주\s*$/i, getDate: (d) => addDays(d, 7) },
];

const EN_PATTERNS: { pattern: RegExp; getDate: (base: Date) => Date }[] = [
  { pattern: /\btoday\s*$/i, getDate: (d) => d },
  { pattern: /\btomorrow\s*$/i, getDate: (d) => addDays(d, 1) },
  { pattern: /\bnext\s+week\s*$/i, getDate: (d) => addDays(d, 7) },
  { pattern: /\bnext\s+monday\s*$/i, getDate: (d) => nextWeekday(d, 1) },
  { pattern: /\bnext\s+tuesday\s*$/i, getDate: (d) => nextWeekday(d, 2) },
  { pattern: /\bnext\s+wednesday\s*$/i, getDate: (d) => nextWeekday(d, 3) },
  { pattern: /\bnext\s+thursday\s*$/i, getDate: (d) => nextWeekday(d, 4) },
  { pattern: /\bnext\s+friday\s*$/i, getDate: (d) => nextWeekday(d, 5) },
  { pattern: /\bnext\s+saturday\s*$/i, getDate: (d) => nextWeekday(d, 6) },
  { pattern: /\bnext\s+sunday\s*$/i, getDate: (d) => nextWeekday(d, 0) },
];

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function nextWeekday(d: Date, dayOfWeek: number): Date {
  const out = new Date(d);
  const current = out.getDay();
  let diff = dayOfWeek - current;
  if (diff <= 0) diff += 7;
  out.setDate(out.getDate() + diff);
  return out;
}

/**
 * 텍스트 끝에서 자연어 날짜를 찾아 제거하고, 날짜와 나머지 텍스트를 반환.
 */
export function parseNaturalDate(
  text: string,
  baseDate: Date = new Date()
): ParsedNaturalDate | null {
  const trimmed = text.trim();
  const all = [...KO_PATTERNS, ...EN_PATTERNS];
  for (const { pattern, getDate } of all) {
    const match = trimmed.match(pattern);
    if (match) {
      const rest = trimmed.slice(0, match.index).trim();
      const date = getDate(baseDate);
      date.setHours(9, 0, 0, 0);
      return { date, restText: rest };
    }
  }
  return null;
}
