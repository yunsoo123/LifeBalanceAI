import type { ParsedScheduleEvent } from '@/lib/ai/parse-schedule';
import { getStartOfWeek } from '@/lib/weekUtils';

/** One event to insert: start_time/end_time are ISO strings */
export interface EventToCreate {
  title: string;
  start_time: string;
  end_time: string;
  color: string;
}

const BLOCK_COLORS = [
  '#6366F1', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#06B6D4', // cyan
];

/**
 * Parse "HH:mm" to minutes since midnight
 */
function timeToMinutes(s: string): number {
  const [h, m] = s.split(':').map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

/**
 * Get duration in minutes from event (endTime - startTime or durationHours)
 */
function durationMinutes(ev: ParsedScheduleEvent): number {
  if (ev.startTime && ev.endTime) {
    return Math.max(30, timeToMinutes(ev.endTime) - timeToMinutes(ev.startTime));
  }
  if (ev.durationHours != null) return Math.max(30, Math.round(ev.durationHours * 60));
  return 60;
}

/**
 * Place fixed events first (with days + time), then flexible in free slots.
 * weekStart: YYYY-MM-DD (Monday).
 */
export function placeParsedEvents(
  parsedEvents: ParsedScheduleEvent[],
  weekStartInput?: string
): EventToCreate[] {
  const monday = weekStartInput || getStartOfWeek(new Date());
  const [y, mo, d] = monday.split('-').map(Number);
  const weekStartDate = new Date(y, mo - 1, d);

  const result: EventToCreate[] = [];
  const usedSlots: { day: number; startMin: number; endMin: number }[] = [];

  const getDate = (dayIndex: number): Date => {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + dayIndex);
    return d;
  };

  const toISO = (date: Date, startMin: number): string => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setMinutes(startMin, 0, 0);
    return d.toISOString();
  };

  const overlaps = (day: number, startMin: number, endMin: number): boolean => {
    return usedSlots.some(
      (s) => s.day === day && s.startMin < endMin && s.endMin > startMin
    );
  };

  const addSlot = (day: number, startMin: number, endMin: number) => {
    usedSlots.push({ day, startMin, endMin });
  };

  const flexibleSlots: { day: number; startMin: number; endMin: number }[] = [];
  for (let day = 0; day < 7; day++) {
    flexibleSlots.push({ day, startMin: 9 * 60, endMin: 11 * 60 });
    flexibleSlots.push({ day, startMin: 14 * 60, endMin: 16 * 60 });
    flexibleSlots.push({ day, startMin: 19 * 60, endMin: 21 * 60 });
  }

  let colorIndex = 0;
  const fixed: ParsedScheduleEvent[] = [];
  const flexible: ParsedScheduleEvent[] = [];
  for (const ev of parsedEvents) {
    const hasDays = Array.isArray(ev.days) && ev.days.length > 0;
    const hasTime = ev.startTime != null || ev.durationHours != null;
    if (hasDays && hasTime) fixed.push(ev);
    else flexible.push(ev);
  }

  for (const ev of fixed) {
    const color = BLOCK_COLORS[colorIndex % BLOCK_COLORS.length];
    colorIndex++;
    const dur = durationMinutes(ev);
    const startMin = ev.startTime ? timeToMinutes(ev.startTime) : 9 * 60;
    const endMin = startMin + dur;
    const days = ev.days ?? [0];

    for (const day of days) {
      if (day < 0 || day > 6) continue;
      if (overlaps(day, startMin, endMin)) continue;
      const date = getDate(day);
      result.push({
        title: ev.title,
        start_time: toISO(date, startMin),
        end_time: toISO(date, endMin),
        color,
      });
      addSlot(day, startMin, endMin);
    }
  }

  for (const ev of flexible) {
    const color = BLOCK_COLORS[colorIndex % BLOCK_COLORS.length];
    colorIndex++;
    const dur = durationMinutes(ev);
    let remaining = dur;
    for (const slot of flexibleSlots) {
      if (remaining <= 0) break;
      if (overlaps(slot.day, slot.startMin, slot.endMin)) continue;
      const slotDur = slot.endMin - slot.startMin;
      const take = Math.min(remaining, slotDur);
      const startDate = getDate(slot.day);
      result.push({
        title: ev.title,
        start_time: toISO(startDate, slot.startMin),
        end_time: toISO(startDate, slot.startMin + take),
        color,
      });
      addSlot(slot.day, slot.startMin, slot.startMin + take);
      remaining -= take;
    }
  }

  return result;
}
