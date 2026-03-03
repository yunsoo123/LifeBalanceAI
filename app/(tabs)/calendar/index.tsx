import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, EmptyState, Spinner, TimeWheelPicker } from '@/components/ui';
import { LAYOUT } from '@/lib/layoutConstants';
import { useTheme } from '@/lib/ThemeContext';
import { colors, getSurface, fontFamily } from '@/lib/design-system';
import { supabase, tables } from '@/lib/supabase/client';
import { getStartOfWeek } from '@/lib/weekUtils';
import { useI18n } from '@/lib/i18n';
import { useToastContext } from '@/lib/ToastContext';
import { getLocaleFromLang, formatDateByLang, formatTimeByLang } from '@/lib/formatByLang';

type TodoRow = {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  category: string | null;
  recurrence: string | null;
  recurrence_weekday: number | null;
  achievement_percent: number | null;
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
  priority?: number; // 1=highest, 5=lowest (TickTick-style)
  recurrence?: string | null;
}

/** 해당 월의 1일 00:00 ~ 말일 23:59:59 */
function getMonthBounds(monthDate: Date): { start: Date; end: Date } {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const start = new Date(y, m, 1, 0, 0, 0, 0);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/** 아이폰 달력형: 6주×7일 그리드. 빈 칸은 null */
function getMonthGrid(monthDate: Date): (Date | null)[][] {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startPad = first.getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
  const total = 6 * 7;
  while (cells.length < total) cells.push(null);

  const grid: (Date | null)[][] = [];
  for (let row = 0; row < 6; row++) {
    grid.push(cells.slice(row * 7, (row + 1) * 7));
  }
  return grid;
}

/** Format date for display; pass locale from getLocaleFromLang(lang). */
function formatDate(date: Date, locale: 'ko-KR' | 'en-US'): string {
  return formatDateByLang(date, locale, { month: 'short', day: 'numeric' });
}

/** Format time for display; pass locale from getLocaleFromLang(lang). */
function formatTime(date: Date, locale: 'ko-KR' | 'en-US'): string {
  return formatTimeByLang(date, locale, { hour: 'numeric', minute: '2-digit', hour12: false });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/** recurrence_weekday 0=Mon .. 6=Sun → localized weekday name */
function getWeekdayName(
  dayIndex: number,
  locale: 'ko-KR' | 'en-US',
  style: 'short' | 'long' = 'short'
): string {
  if (dayIndex < 0 || dayIndex > 6) return '';
  const d = new Date(2024, 0, 1 + dayIndex);
  return d.toLocaleDateString(locale, { weekday: style });
}

/** 실기기에서 Pan 제스처 시 에러 없이 튕김 방지: false면 길게 누른 뒤 셀 탭으로만 이동 */
const TIMETABLE_DRAG_ENABLED = false;

/** YYYY-MM-DD (Monday) → that week Mon..Sun as Date[] (local) */
function getWeekDatesFromMonday(weekStart: string): Date[] {
  const [y, m, d] = weekStart.split('-').map(Number);
  const monday = new Date(y, m - 1, d, 0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x;
  });
}

/** Monday of the week containing the 1st of the given month, as YYYY-MM-DD */
function getWeekStartForMonth(monthDate: Date): string {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const day = first.getDay();
  const toMonday = day === 0 ? -6 : 1 - day;
  first.setDate(first.getDate() + toMonday);
  const y = first.getFullYear();
  const m = String(first.getMonth() + 1).padStart(2, '0');
  const dayNum = String(first.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayNum}`;
}

export default function CalendarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ focusWeek?: string }>();
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const locale = getLocaleFromLang(lang);
  const { showSuccess } = useToastContext();
  const [viewingMonth, setViewingMonth] = useState<Date>(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formStartTime, setFormStartTime] = useState<string>('09:00');
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formEndTime, setFormEndTime] = useState<string>('10:00');
  const [formRecurrence, setFormRecurrence] = useState<string | null>(null);
  const [addFormDate, setAddFormDate] = useState<Date>(() => new Date());
  const [showAddFormDatePicker, setShowAddFormDatePicker] = useState(false);
  const [addFormDatePickerMonth, setAddFormDatePickerMonth] = useState<Date>(() => new Date());
  /** 'start' | 'end' = 시간 선택 전용 모달 표시 (중첩 스크롤 제거로 터치 가능) */
  const [timePickerOpen, setTimePickerOpen] = useState<'start' | 'end' | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'timetable'>('timetable');
  /** Calendar tab segment: events (default) or todos */
  const [calendarSegment, setCalendarSegment] = useState<'events' | 'todos'>('events');
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [todoInputVisible, setTodoInputVisible] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date | null>(null);
  const [newTodoCategory, setNewTodoCategory] = useState<string | null>(null);
  const [newTodoRecurrence, setNewTodoRecurrence] = useState<string | null>(null);
  const [newTodoRecurrenceWeekday, setNewTodoRecurrenceWeekday] = useState<number | null>(null);
  const [todoDueDateModal, setTodoDueDateModal] = useState<{
    visible: boolean;
    todoId: string | null;
    currentDueDate: string | null;
  }>({ visible: false, todoId: null, currentDueDate: null });
  const [todoAchievementModal, setTodoAchievementModal] = useState<{
    visible: boolean;
    todoId: string | null;
  }>({ visible: false, todoId: null });
  const [editingDueDate, setEditingDueDate] = useState<Date>(() => new Date());
  /** Timetable shows this week (YYYY-MM-DD Monday). Synced with focusWeek or month nav. */
  const [timetableWeekStart, setTimetableWeekStart] = useState<string>(() => getStartOfWeek());
  // Edit: now handled by full-screen route calendar/edit/[id]
  // Track 2: drag-to-move in timetable (long-press to pick, tap cell to drop)
  const [movingEventId, setMovingEventId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ dayIndex: number; startMinutes: number } | null>(
    null
  );
  const [conflictModal, setConflictModal] = useState<{
    visible: boolean;
    eventId: string;
    newStart: Date;
    newEnd: Date;
    otherTitle?: string;
  }>({ visible: false, eventId: '', newStart: new Date(), newEnd: new Date() });
  const [refreshing, setRefreshing] = useState(false);
  // Phase 2: real drag — ghost position and event, grid layout for drop cell
  const [dragGhostPosition, setDragGhostPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragEvent, setDragEvent] = useState<CalendarEvent | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const timetableGridRef = useRef<View>(null);
  const timetableScrollOffsetRef = useRef(0);
  const gridLayoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(
    null
  );
  const lastGhostPositionRef = useRef<{ x: number; y: number } | null>(null);
  const dragEventRef = useRef<CalendarEvent | null>(null);
  const timetableBlockRefsMap = useRef<Map<string, View | null>>(new Map());
  const TIMETABLE_HEADER_OFFSET = 44;
  const ROW_HEIGHT = 48;
  const TIME_COL_WIDTH = 44;

  const getEventsForDay = useCallback(
    (day: Date): CalendarEvent[] => {
      return events
        .filter((e) => isSameDay(e.start, day))
        .sort((a, b) => a.start.getTime() - b.start.getTime());
    },
    [events]
  );

  const eventsForSelectedDay = useMemo(() => {
    const list = getEventsForDay(selectedDay);
    return [...list].sort((a, b) => {
      const pa = a.priority ?? 3;
      const pb = b.priority ?? 3;
      if (pa !== pb) return pa - pb;
      return a.start.getTime() - b.start.getTime();
    });
  }, [getEventsForDay, selectedDay]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const dayStart = new Date(selectedDay);
        dayStart.setHours(7, 0, 0, 0);
        const dayEnd = new Date(selectedDay);
        dayEnd.setHours(8, 0, 0, 0);
        setEvents([
          {
            id: 'mock-1',
            title: 'Morning Workout',
            start: dayStart,
            end: dayEnd,
            color: '#10B981',
          },
        ]);
        return;
      }

      const { start: monthStart, end: monthEnd } = getMonthBounds(viewingMonth);

      const { data, error } = await tables
        .events()
        .select('*')
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString())
        .order('start_time');

      if (error) throw error;

      const mapRow = (e: {
        id: string;
        title: string;
        start_time: string;
        end_time: string;
        color?: string;
        description?: string | null;
        priority?: number;
        recurrence?: string | null;
      }): CalendarEvent => ({
        id: e.id,
        title: e.title,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        color: e.color ?? '#6366F1',
        description: e.description ?? undefined,
        priority: e.priority ?? 3,
        recurrence: e.recurrence ?? null,
      });

      const byId = new Map<string, CalendarEvent>();
      for (const e of data || []) {
        byId.set(e.id, mapRow(e));
      }

      // When timetable shows a week outside current month, load that week too so events appear in both views
      const [y, mo, day] = timetableWeekStart.split('-').map(Number);
      const weekMon = new Date(y, mo - 1, day, 0, 0, 0, 0);
      const weekSun = new Date(weekMon);
      weekSun.setDate(weekMon.getDate() + 6);
      weekSun.setHours(23, 59, 59, 999);
      if (weekMon < monthStart || weekSun > monthEnd) {
        const { data: weekData } = await tables
          .events()
          .select('*')
          .gte('start_time', weekMon.toISOString())
          .lte('start_time', weekSun.toISOString())
          .order('start_time');
        for (const e of weekData || []) {
          if (!byId.has(e.id)) byId.set(e.id, mapRow(e));
        }
      }

      const merged = Array.from(byId.values()).sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      );
      setEvents(merged);
    } catch (error) {
      console.error('Load events error:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [viewingMonth, selectedDay, timetableWeekStart]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // When navigating from Schedule "Add to calendar", focus timetable on that week
  useEffect(() => {
    const focusWeek = params.focusWeek;
    if (focusWeek && /^\d{4}-\d{2}-\d{2}$/.test(focusWeek)) {
      const d = new Date(focusWeek + 'T12:00:00');
      if (!isNaN(d.getTime())) {
        setTimetableWeekStart(focusWeek);
        setViewingMonth(d);
        setViewMode('timetable');
      }
    }
  }, [params.focusWeek]);

  const loadTodos = useCallback(async () => {
    setTodosLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setTodos([]);
      setTodosLoading(false);
      return;
    }
    const { data, error } = await tables
      .todos()
      .select(
        'id, title, completed, due_date, created_at, category, recurrence, recurrence_weekday, achievement_percent'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setTodos(data as TodoRow[]);
    setTodosLoading(false);
  }, []);

  useEffect(() => {
    if (calendarSegment === 'todos') loadTodos();
  }, [calendarSegment, loadTodos]);

  async function createEvent(
    overrideTitle?: string,
    overrideStartTime?: string,
    overrideDuration?: number,
    overrideDate?: Date
  ) {
    const title = (overrideTitle ?? formTitle).trim();
    const startTime = overrideStartTime ?? formStartTime;
    const durationMin = overrideDuration ?? formDuration;
    const baseDate = overrideDate ?? selectedDay;

    if (!title) {
      Alert.alert(t.calendar.eventTitle, t.calendar.eventTitleRequired);
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert(t.calendar.signInRequiredTitle, t.calendar.signInRequiredMessage, [
          { text: t.common.cancel, style: 'cancel' },
          { text: t.auth.signIn, onPress: () => router.replace('/sign-in') },
        ]);
        setLoading(false);
        return;
      }

      const [startH, startM] = startTime.split(':').map(Number);
      const startDate = new Date(baseDate);
      startDate.setHours(isNaN(startH) ? 9 : startH, isNaN(startM) ? 0 : startM, 0, 0);

      let endDate: Date;
      if (overrideStartTime !== undefined || overrideDuration !== undefined) {
        endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + durationMin);
      } else {
        const endTime = formEndTime;
        const [endH, endM] = endTime.split(':').map(Number);
        endDate = new Date(baseDate);
        endDate.setHours(isNaN(endH) ? 10 : endH, isNaN(endM) ? 0 : endM, 0, 0);
        if (endDate.getTime() <= startDate.getTime()) {
          Alert.alert(t.common.error, t.calendar.endTimeAfterStart);
          setLoading(false);
          return;
        }
      }

      const { error } = await tables.events().insert({
        user_id: user.id,
        title,
        description: formDescription.trim() || null,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        all_day: false,
        color: colors.brand.primary,
        recurrence: formRecurrence || null,
      });

      if (error) throw error;

      setFormTitle('');
      setFormDescription('');
      setFormStartTime('09:00');
      setFormDuration(60);
      setFormEndTime('10:00');
      setFormRecurrence(null);
      setShowAddModal(false);
      await loadEvents();
      showSuccess(t.calendar.newEvent, t.calendar.createEventSuccess);
    } catch (error) {
      console.error('Create event error:', error);
      const message = error instanceof Error ? error.message : t.calendar.createEventFailed;
      Alert.alert(t.common.error, message);
    } finally {
      setLoading(false);
    }
  }

  function showEventActions(event: CalendarEvent) {
    const weekdayName = event.start.toLocaleDateString(locale, { weekday: 'long' });
    Alert.alert(event.title, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.calendar.eventActionMove, onPress: () => setMovingEventId(event.id) },
      { text: t.calendar.eventActionAddNextWeek, onPress: () => addToNextWeek(event) },
      {
        text: t.calendar.eventActionRepeatWeekday.replace('{weekday}', weekdayName),
        onPress: () => repeatOnWeekday(event),
      },
      {
        text: t.calendar.eventActionDelete,
        style: 'destructive',
        onPress: () => deleteEvent(event.id),
      },
      {
        text: t.calendar.eventActionEdit,
        onPress: () => router.push(`/(tabs)/calendar/edit/${event.id}`),
      },
    ]);
  }

  async function addToNextWeek(event: CalendarEvent) {
    if (event.id.startsWith('mock-')) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert(t.calendar.signInRequiredTitle, t.calendar.signInRequiredMessage);
      return;
    }
    const start = new Date(event.start);
    const end = new Date(event.end);
    start.setDate(start.getDate() + 7);
    end.setDate(end.getDate() + 7);
    setLoading(true);
    try {
      const { error } = await tables.events().insert({
        user_id: user.id,
        title: event.title,
        description: event.description ?? null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        all_day: false,
        color: event.color,
      });
      if (error) throw error;
      await loadEvents();
      showSuccess(t.calendar.addNextWeekSuccess, '');
    } catch (err) {
      console.error('Add to next week error:', err);
      Alert.alert(t.common.error, t.calendar.createEventFailed);
    } finally {
      setLoading(false);
    }
  }

  async function repeatOnWeekday(event: CalendarEvent) {
    if (event.id.startsWith('mock-')) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert(t.calendar.signInRequiredTitle, t.calendar.signInRequiredMessage);
      return;
    }
    setLoading(true);
    try {
      for (let w = 1; w <= 4; w++) {
        const start = new Date(event.start);
        start.setDate(start.getDate() + 7 * w);
        const end = new Date(event.end);
        end.setDate(end.getDate() + 7 * w);
        const { error } = await tables.events().insert({
          user_id: user.id,
          title: event.title,
          description: event.description ?? null,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          all_day: false,
          color: event.color,
        });
        if (error) throw error;
      }
      await loadEvents();
      showSuccess(t.calendar.repeatWeekdaySuccess, '');
    } catch (err) {
      console.error('Repeat weekday error:', err);
      Alert.alert(t.common.error, t.calendar.createEventFailed);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(eventId: string) {
    if (eventId.startsWith('mock-')) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      return;
    }

    Alert.alert(t.calendar.deleteConfirmTitle, t.calendar.deleteConfirmMessage, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.calendar.eventActionDelete,
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const { error } = await tables.events().delete().eq('id', eventId);
            if (error) throw error;
            await loadEvents();
            showSuccess(t.calendar.deleteEventSuccess, '');
          } catch (error) {
            console.error('Delete event error:', error);
            Alert.alert(t.common.error, t.calendar.deleteEventFailed);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  /** Check if [start, end) overlaps any other event on the same day (excluding eventId) */
  function getConflictOnDay(
    eventsList: CalendarEvent[],
    day: Date,
    start: Date,
    end: Date,
    excludeEventId: string
  ): CalendarEvent | null {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    for (const e of eventsList) {
      if (e.id === excludeEventId) continue;
      if (!isSameDay(e.start, day)) continue;
      const a1 = start.getTime();
      const a2 = end.getTime();
      const b1 = e.start.getTime();
      const b2 = e.end.getTime();
      if (a1 < b2 && b1 < a2) return e;
    }
    return null;
  }

  async function updateEventTime(eventId: string, newStart: Date, newEnd: Date) {
    if (eventId.startsWith('mock-')) {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, start: newStart, end: newEnd } : e))
      );
      setMovingEventId(null);
      setDropTarget(null);
      return;
    }
    setLoading(true);
    try {
      const { error } = await tables
        .events()
        .update({
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);
      if (error) throw error;
      await loadEvents();
      setMovingEventId(null);
      setDropTarget(null);
      setConflictModal((prev) => ({ ...prev, visible: false }));
    } catch (error) {
      console.error('Update event time error:', error);
      Alert.alert('Error', 'Failed to update event. Please try again.');
      await loadEvents();
    } finally {
      setLoading(false);
    }
  }

  function goToPreviousMonth() {
    const d = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() - 1, 1);
    setViewingMonth(d);
    setTimetableWeekStart(getWeekStartForMonth(d));
    if (selectedDay.getMonth() !== d.getMonth() || selectedDay.getFullYear() !== d.getFullYear()) {
      setSelectedDay(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  function goToNextMonth() {
    const d = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() + 1, 1);
    setViewingMonth(d);
    setTimetableWeekStart(getWeekStartForMonth(d));
    if (selectedDay.getMonth() !== d.getMonth() || selectedDay.getFullYear() !== d.getFullYear()) {
      setSelectedDay(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  function goToToday() {
    const today = new Date();
    setViewingMonth(today);
    setTimetableWeekStart(getStartOfWeek(today));
    setSelectedDay(today);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (calendarSegment === 'todos') await loadTodos();
      else await loadEvents();
    } finally {
      setRefreshing(false);
    }
  }, [calendarSegment, loadTodos, loadEvents]);

  const monthYearLabel = viewingMonth.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
  const monthGrid = useMemo(() => getMonthGrid(viewingMonth), [viewingMonth]);
  const { width, height } = useWindowDimensions();
  const calendarWidth = Math.min(width - 32, 420);
  const timetableMaxHeight = Math.min(400, (height ?? 600) * 0.5);
  const cellSize = Math.max(40, Math.floor(calendarWidth / 7));
  const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const insets = useSafeAreaInsets();
  const tabBarPadding = 56;
  const bottomPadding = Math.max(insets.bottom, 16) + tabBarPadding;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: getSurface('screen', theme) }}
      className={`flex-1 ${LAYOUT.screenBg}`}
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Phase 2-1: 헤더 — design-system 캡션/제목/버튼 카드 느낌 */}
        <View
          className="flex-row items-center justify-between px-4 py-3 border-b"
          style={{
            borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
          }}
        >
          <View>
            <Text
              className="text-[12px] font-semibold uppercase tracking-wide"
              style={{
                color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                fontFamily: fontFamily.medium,
              }}
            >
              Schedule
            </Text>
            <Text
              className="text-xl font-bold mt-0.5"
              style={{
                color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                fontFamily: fontFamily.bold,
              }}
            >
              Calendar
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                setFormTitle('');
                setFormStartTime('09:00');
                setFormDuration(60);
                setFormEndTime('10:00');
                setAddFormDate(selectedDay);
                setShowAddModal(true);
              }}
              disabled={loading}
              style={{
                minHeight: 48,
                minWidth: 48,
                paddingHorizontal: 16,
                backgroundColor: colors.brand.primary,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              accessibilityLabel={t.calendar.addEvent}
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: fontFamily.bold,
                  color: '#fff',
                }}
              >
                +
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: fontFamily.medium,
                  color: '#fff',
                }}
              >
                {t.calendar.addEvent}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Segment: 일정 | 할 일 */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
          }}
        >
          <Pressable
            onPress={() => setCalendarSegment('events')}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: 12,
              backgroundColor:
                calendarSegment === 'events'
                  ? colors.brand.primary
                  : theme === 'dark'
                    ? colors.surface.input
                    : colors.surface.subtleLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: fontFamily.medium,
                color:
                  calendarSegment === 'events'
                    ? '#fff'
                    : theme === 'dark'
                      ? colors.text.primary
                      : colors.text.primaryLight,
              }}
            >
              {t.calendar.today === '오늘' ? '일정' : 'Calendar'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCalendarSegment('todos')}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: 12,
              backgroundColor:
                calendarSegment === 'todos'
                  ? colors.brand.primary
                  : theme === 'dark'
                    ? colors.surface.input
                    : colors.surface.subtleLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: fontFamily.medium,
                color:
                  calendarSegment === 'todos'
                    ? '#fff'
                    : theme === 'dark'
                      ? colors.text.primary
                      : colors.text.primaryLight,
              }}
            >
              {t.todo.title}
            </Text>
          </Pressable>
        </View>

        {calendarSegment === 'todos' ? (
          <View style={{ padding: 16, paddingBottom: 80 }}>
            {todosLoading ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Spinner size="md" />
              </View>
            ) : (
              <>
                <Pressable
                  onPress={() => setTodoInputVisible(true)}
                  style={{
                    minHeight: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor:
                      theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                    backgroundColor: getSurface('input', theme),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: fontFamily.medium,
                      color: colors.brand.primary,
                    }}
                  >
                    + {t.todo.add}
                  </Text>
                </Pressable>
                {todos.length === 0 ? (
                  <EmptyState
                    icon={<Text style={{ fontSize: 32 }}>☐</Text>}
                    dark={theme === 'dark'}
                    title={t.todo.emptyTitle}
                    description={t.todo.emptyDesc}
                  />
                ) : (
                  <>
                    <Text
                      className="text-[12px] mb-2"
                      style={{
                        color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                        fontFamily: fontFamily.regular,
                      }}
                    >
                      {t.todo.longPressToDelete}
                    </Text>
                    {todos.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={async () => {
                          const { error } = await tables
                            .todos()
                            .update({ completed: !item.completed })
                            .eq('id', item.id);
                          if (!error) loadTodos();
                        }}
                        onLongPress={() => {
                          Alert.alert(t.todo.deleteConfirmTitle, t.todo.deleteConfirmMessage, [
                            { text: t.common.cancel, style: 'cancel' },
                            {
                              text: t.common.delete,
                              style: 'destructive',
                              onPress: async () => {
                                const { error } = await tables.todos().delete().eq('id', item.id);
                                if (!error) {
                                  loadTodos();
                                  showSuccess(t.todo.deleteSuccess, '');
                                }
                              },
                            },
                          ]);
                        }}
                        accessibilityLabel={item.title}
                        accessibilityHint={t.todo.longPressToDelete}
                        accessibilityRole="button"
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          minHeight: 48,
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          marginBottom: 4,
                          borderRadius: 12,
                          backgroundColor: getSurface('card', theme),
                          borderWidth: 1,
                          borderColor:
                            theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                        }}
                      >
                        <Text style={{ marginRight: 12, fontSize: 18 }}>
                          {item.completed ? '☑' : '☐'}
                        </Text>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontSize: 15,
                              fontFamily: fontFamily.regular,
                              color:
                                theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                              textDecorationLine: item.completed ? 'line-through' : 'none',
                              opacity: item.completed ? 0.7 : 1,
                            }}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 8,
                              marginTop: 4,
                            }}
                          >
                            {item.due_date && (
                              <Text
                                style={{
                                  fontSize: 12,
                                  color:
                                    theme === 'dark'
                                      ? colors.text.tertiary
                                      : colors.text.secondaryLight,
                                }}
                              >
                                {new Date(item.due_date + 'T12:00:00').toLocaleDateString(locale, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </Text>
                            )}
                            {item.category && (
                              <View
                                style={{
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  borderRadius: 6,
                                  backgroundColor:
                                    theme === 'dark'
                                      ? colors.surface.input
                                      : colors.border.subtleLight,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 11,
                                    color:
                                      theme === 'dark'
                                        ? colors.text.secondary
                                        : colors.text.secondaryLight,
                                    fontFamily: fontFamily.medium,
                                  }}
                                >
                                  {item.category === 'workout'
                                    ? t.todo.categoryWorkout
                                    : item.category === 'project'
                                      ? t.todo.categoryProject
                                      : item.category === 'study'
                                        ? t.todo.categoryStudy
                                        : item.category}
                                </Text>
                              </View>
                            )}
                            {item.recurrence === 'weekly' && item.recurrence_weekday != null && (
                              <Text
                                style={{
                                  fontSize: 12,
                                  color:
                                    theme === 'dark'
                                      ? colors.text.tertiary
                                      : colors.text.secondaryLight,
                                }}
                              >
                                {lang === 'ko'
                                  ? `매주 ${getWeekdayName(item.recurrence_weekday, locale, 'long')}`
                                  : `Weekly ${getWeekdayName(item.recurrence_weekday, locale, 'long')}`}
                              </Text>
                            )}
                            {item.achievement_percent != null && (
                              <Text
                                style={{
                                  fontSize: 12,
                                  color:
                                    theme === 'dark'
                                      ? colors.text.tertiary
                                      : colors.text.secondaryLight,
                                }}
                              >
                                {item.achievement_percent}%
                              </Text>
                            )}
                          </View>
                        </View>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            setTodoAchievementModal({ visible: true, todoId: item.id });
                          }}
                          style={{
                            minWidth: 44,
                            minHeight: 44,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          accessibilityLabel={t.calendar.achievementLabel}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.brand.primary,
                              fontFamily: fontFamily.medium,
                            }}
                          >
                            {t.calendar.achievementLabel}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            setEditingDueDate(
                              item.due_date ? new Date(item.due_date + 'T12:00:00') : new Date()
                            );
                            setTodoDueDateModal({
                              visible: true,
                              todoId: item.id,
                              currentDueDate: item.due_date,
                            });
                          }}
                          style={{
                            minWidth: 44,
                            minHeight: 44,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          accessibilityLabel={t.todo.changeDate}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.brand.primary,
                              fontFamily: fontFamily.medium,
                            }}
                          >
                            {t.todo.changeDate}
                          </Text>
                        </Pressable>
                      </Pressable>
                    ))}
                  </>
                )}
                {todoInputVisible && (
                  <View
                    style={{
                      marginTop: 12,
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: getSurface('card', theme),
                      borderWidth: 1,
                      borderColor:
                        theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                    }}
                  >
                    <TextInput
                      placeholder={lang === 'ko' ? '할 일 입력' : 'Enter to-do'}
                      placeholderTextColor={colors.text.tertiary}
                      value={newTodoTitle}
                      onChangeText={setNewTodoTitle}
                      style={{
                        minHeight: 44,
                        paddingHorizontal: 12,
                        fontSize: 15,
                        color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                        backgroundColor: getSurface('input', theme),
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                      onSubmitEditing={async () => {
                        const title = newTodoTitle.trim();
                        if (!title) return;
                        const {
                          data: { user },
                        } = await supabase.auth.getUser();
                        if (!user) return;
                        await tables.todos().insert({
                          user_id: user.id,
                          title,
                          due_date: newTodoDueDate
                            ? newTodoDueDate.toISOString().split('T')[0]
                            : null,
                          category: newTodoCategory,
                          recurrence: newTodoRecurrence,
                          recurrence_weekday:
                            newTodoRecurrence === 'weekly' ? newTodoRecurrenceWeekday : null,
                        });
                        setNewTodoTitle('');
                        setNewTodoDueDate(null);
                        setNewTodoCategory(null);
                        setNewTodoRecurrence(null);
                        setNewTodoRecurrenceWeekday(null);
                        setTodoInputVisible(false);
                        loadTodos();
                        showSuccess(t.capture.todoSuccess, '');
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        marginBottom: 6,
                        color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                        fontFamily: fontFamily.medium,
                      }}
                    >
                      {t.todo.dueDate}
                    </Text>
                    <View
                      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}
                    >
                      {[
                        { label: t.todo.recurrenceNone, value: null },
                        { label: lang === 'ko' ? '오늘' : 'Today', value: 'today' },
                        { label: lang === 'ko' ? '내일' : 'Tomorrow', value: 'tomorrow' },
                      ].map(({ label, value }) => {
                        const todayStr = new Date().toDateString();
                        const tomorrowDate = new Date();
                        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                        const tomorrowStr = tomorrowDate.toDateString();
                        const isSet =
                          (value === null && !newTodoDueDate) ||
                          (value === 'today' &&
                            newTodoDueDate &&
                            newTodoDueDate.toDateString() === todayStr) ||
                          (value === 'tomorrow' &&
                            newTodoDueDate &&
                            newTodoDueDate.toDateString() === tomorrowStr);
                        return (
                          <Pressable
                            key={label}
                            onPress={() => {
                              if (value === null) setNewTodoDueDate(null);
                              else if (value === 'today') setNewTodoDueDate(new Date());
                              else if (value === 'tomorrow') {
                                const d = new Date();
                                d.setDate(d.getDate() + 1);
                                setNewTodoDueDate(d);
                              }
                            }}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 8,
                              backgroundColor: isSet
                                ? colors.brand.primary
                                : theme === 'dark'
                                  ? colors.surface.input
                                  : colors.border.subtleLight,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                fontFamily: fontFamily.medium,
                                color: isSet
                                  ? '#fff'
                                  : theme === 'dark'
                                    ? colors.text.secondary
                                    : colors.text.secondaryLight,
                              }}
                            >
                              {label}
                            </Text>
                          </Pressable>
                        );
                      })}
                      {newTodoDueDate && (
                        <Text
                          style={{
                            fontSize: 13,
                            color:
                              theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                            alignSelf: 'center',
                          }}
                        >
                          {newTodoDueDate.toLocaleDateString(locale, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        marginBottom: 6,
                        color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                        fontFamily: fontFamily.medium,
                      }}
                    >
                      {t.todo.category}
                    </Text>
                    <View
                      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}
                    >
                      {[
                        { value: null, label: '—' },
                        { value: 'workout', label: t.todo.categoryWorkout },
                        { value: 'project', label: t.todo.categoryProject },
                        { value: 'study', label: t.todo.categoryStudy },
                        { value: 'other', label: t.todo.categoryOther },
                      ].map(({ value, label }) => (
                        <Pressable
                          key={value ?? 'none'}
                          onPress={() => setNewTodoCategory(value)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 8,
                            backgroundColor:
                              newTodoCategory === value
                                ? colors.brand.primary
                                : theme === 'dark'
                                  ? colors.surface.input
                                  : colors.border.subtleLight,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: fontFamily.medium,
                              color:
                                newTodoCategory === value
                                  ? '#fff'
                                  : theme === 'dark'
                                    ? colors.text.secondary
                                    : colors.text.secondaryLight,
                            }}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        marginBottom: 6,
                        color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                        fontFamily: fontFamily.medium,
                      }}
                    >
                      {t.todo.recurrence}
                    </Text>
                    <View
                      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}
                    >
                      {[
                        { value: null, label: t.todo.recurrenceNone },
                        { value: 'daily', label: t.todo.recurrenceDaily },
                        { value: 'weekly', label: t.todo.recurrenceWeekly },
                        { value: 'monthly', label: t.todo.recurrenceMonthly },
                      ].map(({ value, label }) => (
                        <Pressable
                          key={value ?? 'none'}
                          onPress={() => {
                            setNewTodoRecurrence(value);
                            if (value !== 'weekly') setNewTodoRecurrenceWeekday(null);
                          }}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 8,
                            backgroundColor:
                              newTodoRecurrence === value
                                ? colors.brand.primary
                                : theme === 'dark'
                                  ? colors.surface.input
                                  : colors.border.subtleLight,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: fontFamily.medium,
                              color:
                                newTodoRecurrence === value
                                  ? '#fff'
                                  : theme === 'dark'
                                    ? colors.text.secondary
                                    : colors.text.secondaryLight,
                            }}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    {newTodoRecurrence === 'weekly' && (
                      <>
                        <Text
                          style={{
                            fontSize: 12,
                            marginBottom: 6,
                            marginTop: 4,
                            color:
                              theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                            fontFamily: fontFamily.medium,
                          }}
                        >
                          {lang === 'ko' ? '요일' : 'Day of week'}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 6,
                            marginBottom: 12,
                          }}
                        >
                          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                            <Pressable
                              key={dayIndex}
                              onPress={() =>
                                setNewTodoRecurrenceWeekday(
                                  newTodoRecurrenceWeekday === dayIndex ? null : dayIndex
                                )
                              }
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 8,
                                backgroundColor:
                                  newTodoRecurrenceWeekday === dayIndex
                                    ? colors.brand.primary
                                    : theme === 'dark'
                                      ? colors.surface.input
                                      : colors.border.subtleLight,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: fontFamily.medium,
                                  color:
                                    newTodoRecurrenceWeekday === dayIndex
                                      ? '#fff'
                                      : theme === 'dark'
                                        ? colors.text.secondary
                                        : colors.text.secondaryLight,
                                }}
                              >
                                {getWeekdayName(dayIndex, locale, 'short')}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </>
                    )}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable
                        onPress={() => {
                          setNewTodoTitle('');
                          setNewTodoDueDate(null);
                          setNewTodoCategory(null);
                          setNewTodoRecurrence(null);
                          setNewTodoRecurrenceWeekday(null);
                          setTodoInputVisible(false);
                        }}
                        style={{
                          flex: 1,
                          minHeight: 44,
                          borderRadius: 8,
                          backgroundColor: getSurface('input', theme),
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 15, color: colors.text.secondary }}>
                          {t.common.cancel}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={async () => {
                          const title = newTodoTitle.trim();
                          if (!title) return;
                          const {
                            data: { user },
                          } = await supabase.auth.getUser();
                          if (!user) return;
                          await tables.todos().insert({
                            user_id: user.id,
                            title,
                            due_date: newTodoDueDate
                              ? newTodoDueDate.toISOString().split('T')[0]
                              : null,
                            category: newTodoCategory,
                            recurrence: newTodoRecurrence,
                            recurrence_weekday:
                              newTodoRecurrence === 'weekly' ? newTodoRecurrenceWeekday : null,
                          });
                          setNewTodoTitle('');
                          setNewTodoDueDate(null);
                          setNewTodoCategory(null);
                          setNewTodoRecurrence(null);
                          setNewTodoRecurrenceWeekday(null);
                          setTodoInputVisible(false);
                          loadTodos();
                          showSuccess(t.capture.todoSuccess, '');
                        }}
                        style={{
                          flex: 1,
                          minHeight: 44,
                          borderRadius: 8,
                          backgroundColor: colors.brand.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{ fontSize: 15, fontFamily: fontFamily.medium, color: '#fff' }}
                        >
                          {t.common.add}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          <>
            <View
              className="mx-4 mt-4 rounded-[20px] shadow-sm overflow-hidden"
              style={{
                alignSelf: 'center',
                width: calendarWidth + 2,
                maxWidth: '100%',
                backgroundColor: getSurface('card', theme),
                borderWidth: 1,
                borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
              }}
            >
              {/* Month nav: compact — 작은 패딩·캡션 스타일 월/년 */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 12,
                  paddingTop: 8,
                  paddingBottom: 4,
                }}
              >
                <Pressable
                  onPress={goToPreviousMonth}
                  hitSlop={12}
                  style={{
                    minHeight: 36,
                    minWidth: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                  }}
                  accessibilityLabel="Previous month"
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                    }}
                  >
                    ‹
                  </Text>
                </Pressable>
                <Pressable
                  onPress={goToToday}
                  hitSlop={12}
                  style={{
                    minHeight: 36,
                    minWidth: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                  }}
                  accessibilityLabel="Go to today"
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: fontFamily.bold,
                      color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                    }}
                  >
                    {monthYearLabel}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={goToNextMonth}
                  hitSlop={12}
                  style={{
                    minHeight: 36,
                    minWidth: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                  }}
                  accessibilityLabel="Next month"
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                    }}
                  >
                    ›
                  </Text>
                </Pressable>
              </View>

              {/* View toggle: 월간 / 이번 주 — 더 작은 세그먼트 */}
              <View
                style={{
                  marginHorizontal: 12,
                  marginBottom: 6,
                  flexDirection: 'row',
                  borderRadius: 10,
                  backgroundColor:
                    theme === 'dark' ? colors.surface.input : colors.surface.subtleLight,
                  padding: 3,
                }}
              >
                <Pressable
                  onPress={() => setViewMode('month')}
                  style={{
                    flex: 1,
                    minHeight: 36,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: viewMode === 'month' ? getSurface('card', theme) : undefined,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: fontFamily.medium,
                      color:
                        viewMode === 'month'
                          ? theme === 'dark'
                            ? colors.text.primary
                            : colors.text.primaryLight
                          : theme === 'dark'
                            ? colors.text.secondary
                            : colors.text.secondaryLight,
                    }}
                  >
                    월간
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setViewMode('timetable')}
                  style={{
                    flex: 1,
                    minHeight: 36,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      viewMode === 'timetable' ? getSurface('card', theme) : undefined,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: fontFamily.medium,
                      color:
                        viewMode === 'timetable'
                          ? theme === 'dark'
                            ? colors.text.primary
                            : colors.text.primaryLight
                          : theme === 'dark'
                            ? colors.text.secondary
                            : colors.text.secondaryLight,
                    }}
                  >
                    이번 주
                  </Text>
                </Pressable>
              </View>

              {viewMode === 'month' && (
                <>
                  {/* 요일 헤더: 7열 고정 (웹에서도 가로 유지) */}
                  <View
                    style={{
                      flexDirection: 'row',
                      width: calendarWidth,
                      borderBottomWidth: 1,
                      borderBottomColor: 'rgba(156, 163, 175, 0.3)',
                    }}
                  >
                    {WEEKDAY_LABELS.map((label, i) => (
                      <View
                        key={i}
                        style={{
                          width: cellSize,
                          minWidth: cellSize,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: fontFamily.medium,
                            color:
                              theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                          }}
                        >
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* 월 그리드 6×7: 각 행 flexDirection row, 셀 고정 크기 */}
                  {monthGrid.map((row, rowIdx) => (
                    <View
                      key={rowIdx}
                      style={{
                        flexDirection: 'row',
                        width: calendarWidth,
                      }}
                    >
                      {row.map((cell, colIdx) => {
                        const isSelected = cell !== null && isSameDay(cell, selectedDay);
                        const isToday = cell !== null && isSameDay(cell, new Date());
                        const dayEvents = cell ? getEventsForDay(cell) : [];
                        const isOtherMonth =
                          cell !== null && cell.getMonth() !== viewingMonth.getMonth();

                        return (
                          <Pressable
                            key={colIdx}
                            onPress={() => {
                              if (cell) {
                                setSelectedDay(cell);
                                setTimetableWeekStart(getStartOfWeek(cell));
                                setViewMode('timetable');
                              }
                            }}
                            style={{
                              width: cellSize,
                              minWidth: cellSize,
                              height: cellSize,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderBottomWidth: rowIdx < 5 ? 1 : 0,
                              borderRightWidth: colIdx < 6 ? 1 : 0,
                              borderColor: 'rgba(156, 163, 175, 0.2)',
                            }}
                          >
                            {cell ? (
                              <>
                                <View
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isSelected ? colors.brand.primary : undefined,
                                    borderWidth: isToday && !isSelected ? 2 : 0,
                                    borderColor: colors.brand.primary,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 15,
                                      fontWeight: '500',
                                      color: isSelected
                                        ? '#fff'
                                        : isToday
                                          ? colors.brand.primary
                                          : isOtherMonth
                                            ? 'rgba(156, 163, 175, 0.6)'
                                            : undefined,
                                    }}
                                    className={
                                      !isSelected && !isToday && !isOtherMonth
                                        ? 'text-gray-900 dark:text-gray-100'
                                        : ''
                                    }
                                  >
                                    {cell.getDate()}
                                  </Text>
                                </View>
                                {isToday && (
                                  <Text
                                    style={{
                                      marginTop: 2,
                                      fontSize: 10,
                                      fontFamily: fontFamily.medium,
                                      color:
                                        theme === 'dark'
                                          ? colors.text.secondary
                                          : colors.text.secondaryLight,
                                    }}
                                    numberOfLines={1}
                                  >
                                    {t.calendar.today}
                                  </Text>
                                )}
                                {dayEvents.length > 0 && (
                                  <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                                    {dayEvents.slice(0, 3).map((_, i) => (
                                      <View
                                        key={i}
                                        style={{
                                          width: 4,
                                          height: 4,
                                          borderRadius: 2,
                                          backgroundColor: isSelected
                                            ? '#fff'
                                            : colors.brand.primary,
                                        }}
                                      />
                                    ))}
                                  </View>
                                )}
                              </>
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </>
              )}

              {viewMode === 'timetable' &&
                (() => {
                  const weekDays = getWeekDatesFromMonday(timetableWeekStart);
                  const hours = Array.from({ length: 24 }, (_, i) => i);
                  const movingEvent = movingEventId
                    ? events.find((e) => e.id === movingEventId)
                    : null;
                  const durationMs = movingEvent
                    ? movingEvent.end.getTime() - movingEvent.start.getTime()
                    : 0;

                  const handleCellPress = (dayIndex: number, hour: number) => {
                    if (movingEventId && movingEvent) {
                      const day = weekDays[dayIndex];
                      const newStart = new Date(day);
                      newStart.setHours(hour, 0, 0, 0);
                      if (
                        isSameDay(day, movingEvent.start) &&
                        movingEvent.start.getHours() === hour
                      ) {
                        setMovingEventId(null);
                        setDropTarget(null);
                        return;
                      }
                      const newEnd = new Date(newStart.getTime() + durationMs);
                      const conflict = getConflictOnDay(
                        events,
                        day,
                        newStart,
                        newEnd,
                        movingEventId
                      );
                      if (conflict) {
                        setConflictModal({
                          visible: true,
                          eventId: movingEventId,
                          newStart,
                          newEnd,
                          otherTitle: conflict.title,
                        });
                      } else {
                        updateEventTime(movingEventId, newStart, newEnd);
                      }
                      setDropTarget(null);
                    } else {
                      setSelectedDay(weekDays[dayIndex]);
                    }
                  };

                  function handleDragStart(
                    ev: CalendarEvent,
                    refsMap: React.MutableRefObject<Map<string, View | null>>
                  ) {
                    const view = refsMap.current.get(ev.id);
                    if (!view) return;
                    try {
                      view.measureInWindow((x, y, w, h) => {
                        const cx = x + w / 2;
                        const cy = y + h / 2;
                        dragStartRef.current = { x: cx, y: cy };
                        dragEventRef.current = ev;
                        setDragEvent(ev);
                        setDragGhostPosition({ x: cx, y: cy });
                        lastGhostPositionRef.current = { x: cx, y: cy };
                      });
                    } catch {
                      // measureInWindow can throw on some devices; avoid crash
                    }
                  }
                  function handleDragUpdate(translationX: number, translationY: number) {
                    if (dragEventRef.current == null) return;
                    const start = dragStartRef.current;
                    const next = {
                      x: start.x + translationX,
                      y: start.y + translationY,
                    };
                    lastGhostPositionRef.current = next;
                    setDragGhostPosition(next);
                  }
                  function handleDragEnd() {
                    const pos = lastGhostPositionRef.current;
                    const layout = gridLayoutRef.current;
                    const ev = dragEventRef.current;
                    setDragEvent(null);
                    setDragGhostPosition(null);
                    lastGhostPositionRef.current = null;
                    dragEventRef.current = null;
                    if (!pos || !layout || !ev) return;
                    const scrollY = timetableScrollOffsetRef.current;
                    const cellWidth = (layout.width - TIME_COL_WIDTH) / 7;
                    const relX = pos.x - layout.x - TIME_COL_WIDTH;
                    const relY = pos.y - layout.y - TIMETABLE_HEADER_OFFSET + scrollY;
                    const dayIndex = Math.max(0, Math.min(6, Math.floor(relX / cellWidth)));
                    const rowIndex = Math.max(
                      0,
                      Math.min(hours.length - 1, Math.floor(relY / ROW_HEIGHT))
                    );
                    const hour = hours[rowIndex];
                    const day = weekDays[dayIndex];
                    const newStart = new Date(day);
                    newStart.setHours(hour, 0, 0, 0);
                    const newEnd = new Date(
                      newStart.getTime() + (ev.end.getTime() - ev.start.getTime())
                    );
                    if (isSameDay(day, ev.start) && ev.start.getHours() === hour) {
                      return;
                    }
                    const conflict = getConflictOnDay(events, day, newStart, newEnd, ev.id);
                    if (conflict) {
                      setConflictModal({
                        visible: true,
                        eventId: ev.id,
                        newStart,
                        newEnd,
                        otherTitle: conflict.title,
                      });
                    } else {
                      updateEventTime(ev.id, newStart, newEnd);
                    }
                  }

                  return (
                    <View
                      style={{
                        borderTopWidth: 1,
                        borderTopColor:
                          theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                      }}
                    >
                      {movingEventId ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor:
                              theme === 'dark' ? colors.surface.input : colors.surface.subtleLight,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderBottomWidth: 1,
                            borderBottomColor:
                              theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color:
                                theme === 'dark'
                                  ? colors.text.secondary
                                  : colors.text.secondaryLight,
                            }}
                          >
                            {t.calendar.timetableMoveHint}
                          </Text>
                          <Pressable
                            onPress={() => {
                              setMovingEventId(null);
                              setDropTarget(null);
                              setConflictModal((p) => ({ ...p, visible: false }));
                            }}
                            style={{
                              minHeight: 28,
                              minWidth: 52,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 8,
                              backgroundColor:
                                theme === 'dark' ? colors.surface.input : colors.border.subtleLight,
                            }}
                            accessibilityLabel={t.calendar.timetableMoveCancel}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'System',
                                fontWeight: '500',
                                color:
                                  theme === 'dark'
                                    ? colors.text.secondary
                                    : colors.text.secondaryLight,
                              }}
                            >
                              {t.calendar.timetableMoveCancel}
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <View
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderBottomWidth: 1,
                            borderBottomColor:
                              theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color:
                                theme === 'dark'
                                  ? colors.text.tertiary
                                  : colors.text.secondaryLight,
                            }}
                          >
                            {t.calendar.timetableMoveHint}
                          </Text>
                        </View>
                      )}
                      <View
                        ref={timetableGridRef}
                        onLayout={() => {
                          timetableGridRef.current?.measureInWindow((x, y, w, h) => {
                            gridLayoutRef.current = { x, y, width: w, height: h };
                          });
                        }}
                        style={{ flex: 1 }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            borderBottomWidth: 1,
                            borderColor: 'rgba(156,163,175,0.3)',
                          }}
                        >
                          <View style={{ width: 44, paddingVertical: 8, alignItems: 'center' }}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: fontFamily.medium,
                                color:
                                  theme === 'dark'
                                    ? colors.text.secondary
                                    : colors.text.secondaryLight,
                              }}
                            >
                              Time
                            </Text>
                          </View>
                          {weekDays.map((day, i) => {
                            const isTodayCol = isSameDay(day, new Date());
                            return (
                              <View
                                key={i}
                                style={{ flex: 1, paddingVertical: 6, alignItems: 'center' }}
                              >
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontFamily: fontFamily.medium,
                                    color:
                                      theme === 'dark'
                                        ? colors.text.secondary
                                        : colors.text.secondaryLight,
                                  }}
                                >
                                  {day.toLocaleDateString(locale, { weekday: 'short' })}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    marginTop: 2,
                                    fontFamily: fontFamily.regular,
                                    color:
                                      theme === 'dark' ? colors.text.tertiary : colors.gray[500],
                                  }}
                                >
                                  {day.getDate()}
                                </Text>
                                {isTodayCol && (
                                  <Text
                                    style={{
                                      marginTop: 2,
                                      fontSize: 10,
                                      fontFamily: fontFamily.medium,
                                      color: colors.brand.primary,
                                    }}
                                    numberOfLines={1}
                                  >
                                    {t.calendar.today}
                                  </Text>
                                )}
                              </View>
                            );
                          })}
                        </View>
                        <ScrollView
                          style={{ maxHeight: timetableMaxHeight }}
                          contentContainerStyle={{ paddingBottom: 8 }}
                          showsVerticalScrollIndicator={true}
                          nestedScrollEnabled
                          onScroll={(e) => {
                            timetableScrollOffsetRef.current = e.nativeEvent.contentOffset.y;
                          }}
                          scrollEventThrottle={16}
                        >
                          {hours.map((hour) => (
                            <View
                              key={hour}
                              style={{
                                flexDirection: 'row',
                                minHeight: 48,
                                borderBottomWidth: 1,
                                borderColor: 'rgba(156,163,175,0.15)',
                              }}
                            >
                              <View style={{ width: 44, paddingVertical: 4, paddingLeft: 4 }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: fontFamily.regular,
                                    color:
                                      theme === 'dark'
                                        ? colors.text.secondary
                                        : colors.text.secondaryLight,
                                  }}
                                >
                                  {hour}:00
                                </Text>
                              </View>
                              {weekDays.map((day, colIdx) => {
                                const cellEvents = events.filter(
                                  (e) => isSameDay(e.start, day) && e.start.getHours() === hour
                                );
                                const isDropTarget =
                                  dropTarget?.dayIndex === colIdx &&
                                  dropTarget?.startMinutes === hour * 60;
                                return (
                                  <Pressable
                                    key={`${hour}-${colIdx}`}
                                    style={{
                                      flex: 1,
                                      padding: 4,
                                      borderLeftWidth: colIdx > 0 ? 1 : 0,
                                      borderColor: isDropTarget
                                        ? 'rgba(139, 92, 246, 0.6)'
                                        : 'rgba(156,163,175,0.2)',
                                      backgroundColor: isDropTarget
                                        ? 'rgba(139, 92, 246, 0.28)'
                                        : undefined,
                                      ...(isDropTarget && {
                                        borderWidth: 2,
                                        borderColor: 'rgba(139, 92, 246, 0.8)',
                                      }),
                                    }}
                                    onPress={() => handleCellPress(colIdx, hour)}
                                    onPressIn={() =>
                                      movingEventId
                                        ? setDropTarget({
                                            dayIndex: colIdx,
                                            startMinutes: hour * 60,
                                          })
                                        : undefined
                                    }
                                    onPressOut={() =>
                                      movingEventId ? setDropTarget(null) : undefined
                                    }
                                  >
                                    {cellEvents.slice(0, 2).map((ev) => {
                                      const panGesture = TIMETABLE_DRAG_ENABLED
                                        ? Gesture.Pan()
                                            .minDistance(8)
                                            .onStart(() => {
                                              runOnJS(handleDragStart)(ev, timetableBlockRefsMap);
                                            })
                                            .onUpdate((e) => {
                                              runOnJS(handleDragUpdate)(
                                                e.translationX,
                                                e.translationY
                                              );
                                            })
                                            .onEnd(() => {
                                              runOnJS(handleDragEnd)();
                                            })
                                        : undefined;
                                      const blockContent = (
                                        <Pressable
                                          className="rounded-lg px-2 py-1.5 mb-1 min-h-[36px] justify-center"
                                          style={{
                                            backgroundColor: ev.color + '20',
                                            opacity:
                                              movingEventId === ev.id ||
                                              (TIMETABLE_DRAG_ENABLED && dragEvent?.id === ev.id)
                                                ? 0.7
                                                : 1,
                                          }}
                                          onPress={() => {
                                            if (!movingEventId && !dragEvent) showEventActions(ev);
                                          }}
                                          onLongPress={() => setMovingEventId(ev.id)}
                                          delayLongPress={400}
                                          accessibilityLabel={`${ev.title}. ${t.calendar.timetableMoveHint}`}
                                          accessibilityRole="button"
                                        >
                                          <Text
                                            className="font-medium text-gray-900 dark:text-gray-100"
                                            style={{ fontSize: 10, lineHeight: 14 }}
                                            numberOfLines={2}
                                          >
                                            {ev.title}
                                          </Text>
                                          {ev.recurrence ? (
                                            <Text
                                              style={{
                                                fontSize: 9,
                                                marginTop: 2,
                                                color:
                                                  theme === 'dark'
                                                    ? colors.text.tertiary
                                                    : colors.text.secondaryLight,
                                              }}
                                              numberOfLines={1}
                                            >
                                              {ev.recurrence === 'daily'
                                                ? t.todo.recurrenceDaily
                                                : ev.recurrence === 'weekly'
                                                  ? t.todo.recurrenceWeekly
                                                  : ev.recurrence === 'monthly'
                                                    ? t.todo.recurrenceMonthly
                                                    : ev.recurrence}
                                            </Text>
                                          ) : null}
                                        </Pressable>
                                      );
                                      return (
                                        <View
                                          key={ev.id}
                                          ref={
                                            TIMETABLE_DRAG_ENABLED
                                              ? (r) => {
                                                  const map = timetableBlockRefsMap.current;
                                                  if (r === null) map.delete(ev.id);
                                                  else map.set(ev.id, r);
                                                }
                                              : undefined
                                          }
                                          collapsable={TIMETABLE_DRAG_ENABLED ? false : undefined}
                                        >
                                          {panGesture ? (
                                            <GestureDetector gesture={panGesture}>
                                              {blockContent}
                                            </GestureDetector>
                                          ) : (
                                            blockContent
                                          )}
                                        </View>
                                      );
                                    })}
                                  </Pressable>
                                );
                              })}
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  );
                })()}
            </View>

            {/* Events section: block/card style aligned with new-event modal */}
            <View className={`${LAYOUT.containerPadding} pt-5 pb-8`}>
              {loading ? (
                <View className="py-8 items-center">
                  <Spinner size="md" text={t.common.loading} />
                </View>
              ) : (
                <>
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className="text-base font-semibold"
                        style={{
                          color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                          fontFamily: fontFamily.medium,
                        }}
                      >
                        {formatDate(selectedDay, locale)}
                      </Text>
                      <Text
                        className="text-[13px]"
                        style={{
                          color:
                            theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                          fontFamily: fontFamily.regular,
                        }}
                      >
                        · Events
                      </Text>
                    </View>
                    <View
                      className="rounded-xl px-2 py-1"
                      style={{
                        backgroundColor: theme === 'dark' ? colors.surface.card : colors.gray[100],
                      }}
                    >
                      <Text
                        className="text-[11px] font-semibold"
                        style={{
                          color:
                            theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                          fontFamily: fontFamily.medium,
                        }}
                      >
                        {eventsForSelectedDay.length}개
                      </Text>
                    </View>
                  </View>
                  {eventsForSelectedDay.length === 0 ? (
                    <View
                      className="p-5 py-8 rounded-[20px] shadow-sm"
                      style={{
                        backgroundColor:
                          theme === 'dark' ? colors.surface.cardElevated : colors.surface.cardLight,
                        borderWidth: 1,
                        borderColor:
                          theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                      }}
                    >
                      <EmptyState
                        icon={<Text className="text-4xl">📅</Text>}
                        dark={theme === 'dark'}
                        title={t.calendar.emptyTitle}
                        description={t.calendar.emptyDesc}
                        action={{
                          label: t.calendar.emptyAction,
                          onPress: () => router.push('/(tabs)/capture/schedule'),
                        }}
                      />
                    </View>
                  ) : (
                    <View className="flex flex-col gap-2.5">
                      {eventsForSelectedDay.map((event) => (
                        <View
                          key={event.id}
                          className="p-4 rounded-[20px] shadow-sm"
                          style={{
                            backgroundColor:
                              theme === 'dark'
                                ? colors.surface.cardElevated
                                : colors.surface.cardLight,
                            borderWidth: 1,
                            borderColor:
                              theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                          }}
                        >
                          <View className="flex-row items-start gap-3">
                            <View
                              className="mt-0.5 min-h-[44px] w-1 shrink-0 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                            <View className="flex-1 gap-1">
                              <Text
                                className="text-[15px] font-semibold"
                                style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                              >
                                {formatTime(event.start, locale)} – {formatTime(event.end, locale)}
                              </Text>
                              <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {event.title}
                              </Text>
                              {event.recurrence ? (
                                <Text
                                  className="text-xs mt-0.5"
                                  style={{
                                    color:
                                      theme === 'dark'
                                        ? colors.text.tertiary
                                        : colors.text.secondaryLight,
                                  }}
                                >
                                  {event.recurrence === 'daily'
                                    ? t.todo.recurrenceDaily
                                    : event.recurrence === 'weekly'
                                      ? t.todo.recurrenceWeekly
                                      : event.recurrence === 'monthly'
                                        ? t.todo.recurrenceMonthly
                                        : event.recurrence}
                                </Text>
                              ) : null}
                              {event.description ? (
                                <Text className="mt-0.5 text-[13px] leading-snug text-gray-500 dark:text-gray-400">
                                  {event.description}
                                </Text>
                              ) : null}
                            </View>
                            <View className="flex-row items-center gap-1">
                              <Pressable
                                onPress={() => showEventActions(event)}
                                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg"
                                accessibilityLabel={t.calendar.eventActionEdit}
                              >
                                <Text className="text-gray-400 dark:text-gray-500">✎</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => deleteEvent(event.id)}
                                disabled={loading}
                                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg"
                                accessibilityLabel="Delete event"
                              >
                                <Text className="text-gray-400 dark:text-gray-500">🗑</Text>
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Todo due date change modal */}
      <Modal
        visible={todoDueDateModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setTodoDueDateModal({ visible: false, todoId: null, currentDueDate: null })
        }
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
          onPress={() =>
            setTodoDueDateModal({ visible: false, todoId: null, currentDueDate: null })
          }
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 320,
              backgroundColor: getSurface('card', theme),
              borderRadius: 16,
              padding: 24,
              borderWidth: 1,
              borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: fontFamily.medium,
                color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                marginBottom: 16,
              }}
            >
              {t.todo.dueDate}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Pressable
                onPress={() => {
                  const d = new Date(editingDueDate);
                  d.setDate(d.getDate() - 1);
                  setEditingDueDate(d);
                }}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  backgroundColor: getSurface('input', theme),
                }}
              >
                <Text style={{ fontSize: 18, color: colors.brand.primary }}>‹</Text>
              </Pressable>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 15,
                  fontFamily: fontFamily.medium,
                  color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                }}
              >
                {editingDueDate.toLocaleDateString(locale, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Pressable
                onPress={() => {
                  const d = new Date(editingDueDate);
                  d.setDate(d.getDate() + 1);
                  setEditingDueDate(d);
                }}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  backgroundColor: getSurface('input', theme),
                }}
              >
                <Text style={{ fontSize: 18, color: colors.brand.primary }}>›</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                variant="outline"
                size="md"
                onPress={() =>
                  setTodoDueDateModal({ visible: false, todoId: null, currentDueDate: null })
                }
                style={{ flex: 1 }}
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="primary"
                size="md"
                onPress={async () => {
                  if (!todoDueDateModal.todoId) return;
                  const dateStr = editingDueDate.toISOString().split('T')[0];
                  const { error } = await tables
                    .todos()
                    .update({ due_date: dateStr, updated_at: new Date().toISOString() })
                    .eq('id', todoDueDateModal.todoId);
                  if (!error) {
                    loadTodos();
                    showSuccess(t.todo.dueDate, '');
                  }
                  setTodoDueDateModal({ visible: false, todoId: null, currentDueDate: null });
                }}
                style={{ flex: 1 }}
              >
                {t.common.save}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Todo achievement modal: set 0–100% (Phase B #7) */}
      <Modal
        visible={todoAchievementModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setTodoAchievementModal({ visible: false, todoId: null })}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
          onPress={() => setTodoAchievementModal({ visible: false, todoId: null })}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 320,
              padding: 20,
              borderRadius: 16,
              backgroundColor: theme === 'dark' ? colors.surface.card : colors.surface.cardLight,
              borderWidth: 1,
              borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: fontFamily.medium,
                color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                marginBottom: 16,
              }}
            >
              {t.calendar.achievementLabel}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {[0, 25, 50, 75, 100].map((pct) => (
                <Pressable
                  key={pct}
                  onPress={async () => {
                    if (!todoAchievementModal.todoId) return;
                    const { error } = await tables
                      .todos()
                      .update({
                        achievement_percent: pct,
                        updated_at: new Date().toISOString(),
                      })
                      .eq('id', todoAchievementModal.todoId);
                    if (!error) {
                      loadTodos();
                      showSuccess(t.calendar.achievementLabel, '');
                    }
                    setTodoAchievementModal({ visible: false, todoId: null });
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: colors.brand.primary,
                  }}
                >
                  <Text style={{ fontSize: 14, fontFamily: fontFamily.medium, color: '#fff' }}>
                    {pct}%
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={async () => {
                  if (!todoAchievementModal.todoId) return;
                  const { error } = await tables
                    .todos()
                    .update({
                      achievement_percent: null,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', todoAchievementModal.todoId);
                  if (!error) loadTodos();
                  setTodoAchievementModal({ visible: false, todoId: null });
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: getSurface('input', theme),
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: fontFamily.medium,
                    color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                  }}
                >
                  {lang === 'ko' ? '지우기' : 'Clear'}
                </Text>
              </Pressable>
            </View>
            <Button
              variant="outline"
              size="md"
              onPress={() => setTodoAchievementModal({ visible: false, todoId: null })}
            >
              {t.common.cancel}
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Event Modal: Post-it style card (approach B) — fixed dimensions and shadow to avoid overlap */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
            }}
            onPress={() => setShowAddModal(false)}
            accessibilityLabel="Close modal"
            accessibilityRole="button"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              accessibilityLabel={t.calendar.newEvent}
              style={{
                width: '100%',
                maxWidth: 400,
                minHeight: 520,
                maxHeight: '85%',
                backgroundColor: theme === 'dark' ? colors.surface.card : colors.surface.cardLight,
                borderRadius: 20,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 16,
              }}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}
                showsVerticalScrollIndicator={true}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '700',
                    lineHeight: 28,
                    marginBottom: 20,
                    color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                    fontFamily: fontFamily.bold,
                  }}
                >
                  {t.calendar.newEvent}
                </Text>
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      lineHeight: 18,
                      marginBottom: 8,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    {t.calendar.eventTitle}
                  </Text>
                  <View
                    style={{
                      minHeight: 48,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                      backgroundColor: theme === 'dark' ? 'rgba(39,39,42,0.5)' : '#f9fafb',
                      justifyContent: 'center',
                    }}
                  >
                    <TextInput
                      style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: theme === 'dark' ? '#fafafa' : '#111827',
                        padding: 0,
                      }}
                      placeholder={t.calendar.eventTitlePlaceholder}
                      placeholderTextColor="#9CA3AF"
                      value={formTitle}
                      onChangeText={setFormTitle}
                    />
                  </View>
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      lineHeight: 18,
                      marginBottom: 8,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    {t.calendar.descriptionOptional}
                  </Text>
                  <View
                    style={{
                      minHeight: 48,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                      backgroundColor: theme === 'dark' ? 'rgba(39,39,42,0.5)' : '#f9fafb',
                      justifyContent: 'center',
                    }}
                  >
                    <TextInput
                      style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: theme === 'dark' ? '#fafafa' : '#111827',
                        padding: 0,
                      }}
                      placeholder={t.calendar.descriptionPlaceholder}
                      placeholderTextColor="#9CA3AF"
                      value={formDescription}
                      onChangeText={setFormDescription}
                    />
                  </View>
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      lineHeight: 18,
                      marginBottom: 8,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    {t.calendar.date}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      marginBottom: 6,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                    }}
                  >
                    {t.calendar.dateTapHint}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable
                      onPress={() => {
                        const d = new Date(addFormDate);
                        d.setDate(d.getDate() - 1);
                        setAddFormDate(d);
                      }}
                      style={{
                        minHeight: 48,
                        minWidth: 48,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                        backgroundColor: theme === 'dark' ? 'rgba(39,39,42,0.5)' : '#f9fafb',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      accessibilityLabel={t.calendar.prevDay}
                    >
                      <Text
                        style={{ fontSize: 18, color: theme === 'dark' ? '#fafafa' : '#111827' }}
                      >
                        ◀
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setAddFormDatePickerMonth(new Date(addFormDate));
                        setShowAddFormDatePicker(true);
                      }}
                      style={{
                        flex: 1,
                        minHeight: 48,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                        backgroundColor: theme === 'dark' ? 'rgba(39,39,42,0.5)' : '#f9fafb',
                        justifyContent: 'center',
                      }}
                      accessibilityLabel={t.calendar.date}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          lineHeight: 24,
                          color: theme === 'dark' ? '#fafafa' : '#111827',
                        }}
                      >
                        {addFormDate.toLocaleDateString(locale, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        const d = new Date(addFormDate);
                        d.setDate(d.getDate() + 1);
                        setAddFormDate(d);
                      }}
                      style={{
                        minHeight: 48,
                        minWidth: 48,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                        backgroundColor: theme === 'dark' ? 'rgba(39,39,42,0.5)' : '#f9fafb',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      accessibilityLabel={t.calendar.nextDay}
                    >
                      <Text
                        style={{ fontSize: 18, color: theme === 'dark' ? '#fafafa' : '#111827' }}
                      >
                        ▶
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      lineHeight: 18,
                      marginBottom: 8,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    {t.calendar.startTime}
                  </Text>
                  <Pressable
                    onPress={() => setTimePickerOpen('start')}
                    style={{
                      minHeight: 48,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                      backgroundColor: theme === 'dark' ? 'rgba(39,39,42,0.5)' : '#f9fafb',
                      justifyContent: 'center',
                    }}
                    accessibilityLabel={t.calendar.startTime}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: theme === 'dark' ? '#fafafa' : '#111827',
                      }}
                    >
                      {formStartTime}
                    </Text>
                  </Pressable>
                </View>
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      lineHeight: 18,
                      marginBottom: 8,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    {t.calendar.endTime}
                  </Text>
                  <Pressable
                    onPress={() => setTimePickerOpen('end')}
                    style={{
                      minHeight: 48,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                      backgroundColor: theme === 'dark' ? 'rgba(39,39,42,0.5)' : '#f9fafb',
                      justifyContent: 'center',
                    }}
                    accessibilityLabel={t.calendar.endTime}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: theme === 'dark' ? '#fafafa' : '#111827',
                      }}
                    >
                      {formEndTime}
                    </Text>
                  </Pressable>
                </View>
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      lineHeight: 18,
                      marginBottom: 8,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    {t.calendar.recurrenceLabel}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { value: null, label: t.todo.recurrenceNone },
                      { value: 'daily', label: t.todo.recurrenceDaily },
                      { value: 'weekly', label: t.todo.recurrenceWeekly },
                      { value: 'monthly', label: t.todo.recurrenceMonthly },
                    ].map(({ value, label }) => (
                      <Pressable
                        key={value ?? 'none'}
                        onPress={() => setFormRecurrence(value)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor:
                            formRecurrence === value
                              ? colors.brand.primary
                              : theme === 'dark'
                                ? colors.surface.input
                                : colors.border.subtleLight,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: fontFamily.medium,
                            color:
                              formRecurrence === value
                                ? '#fff'
                                : theme === 'dark'
                                  ? colors.text.secondary
                                  : colors.text.secondaryLight,
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1 min-h-[48px]"
                    onPress={() => setShowAddModal(false)}
                    accessibilityLabel={t.common.cancel}
                  >
                    {t.common.cancel}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1 min-h-[48px]"
                    onPress={() => createEvent(undefined, undefined, undefined, addFormDate)}
                    disabled={loading}
                    accessibilityLabel={loading ? t.calendar.creating : t.calendar.create}
                  >
                    {loading ? t.calendar.creating : t.calendar.create}
                  </Button>
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Time picker modal: only content = wheel, no parent ScrollView → 터치/스크롤 가능 */}
      <Modal
        visible={timePickerOpen !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTimePickerOpen(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
          onPress={() => setTimePickerOpen(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 280,
              backgroundColor: theme === 'dark' ? colors.surface.card : colors.surface.cardLight,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 16,
                color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                fontFamily: fontFamily.medium,
              }}
            >
              {timePickerOpen === 'start' ? t.calendar.startTime : t.calendar.endTime}
            </Text>
            <TimeWheelPicker
              value={timePickerOpen === 'start' ? formStartTime : formEndTime}
              onChange={timePickerOpen === 'start' ? setFormStartTime : setFormEndTime}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
            <Button
              variant="primary"
              size="md"
              className="mt-4 w-full min-h-[48px]"
              onPress={() => setTimePickerOpen(null)}
              accessibilityLabel={t.common.done}
            >
              {t.common.done}
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add-event date picker: tap date in add form → choose day from calendar */}
      <Modal
        visible={showAddFormDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddFormDatePicker(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
          onPress={() => setShowAddFormDatePicker(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 340,
              backgroundColor: theme === 'dark' ? colors.surface.card : colors.surface.cardLight,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Pressable
                onPress={() => {
                  const d = new Date(addFormDatePickerMonth);
                  d.setMonth(d.getMonth() - 1);
                  setAddFormDatePickerMonth(d);
                }}
                style={{ padding: 8 }}
                accessibilityLabel={t.calendar.prevDay}
              >
                <Text style={{ fontSize: 18, color: theme === 'dark' ? '#fafafa' : '#111827' }}>
                  ◀
                </Text>
              </Pressable>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                }}
              >
                {addFormDatePickerMonth.toLocaleDateString(locale, {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Pressable
                onPress={() => {
                  const d = new Date(addFormDatePickerMonth);
                  d.setMonth(d.getMonth() + 1);
                  setAddFormDatePickerMonth(d);
                }}
                style={{ padding: 8 }}
                accessibilityLabel={t.calendar.nextDay}
              >
                <Text style={{ fontSize: 18, color: theme === 'dark' ? '#fafafa' : '#111827' }}>
                  ▶
                </Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
                <View
                  key={i}
                  style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                    }}
                  >
                    {wd}
                  </Text>
                </View>
              ))}
              {getMonthGrid(addFormDatePickerMonth)
                .flat()
                .map((cell, idx) => (
                  <View key={idx} style={{ width: `${100 / 7}%`, padding: 2 }}>
                    {cell ? (
                      <Pressable
                        onPress={() => {
                          setAddFormDate(cell);
                          setShowAddFormDatePicker(false);
                        }}
                        style={{
                          height: 36,
                          borderRadius: 8,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSameDay(cell, addFormDate)
                            ? colors.brand.primary
                            : theme === 'dark'
                              ? 'rgba(39,39,42,0.5)'
                              : '#f3f4f6',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: isSameDay(cell, addFormDate)
                              ? '#fff'
                              : cell.getMonth() !== addFormDatePickerMonth.getMonth()
                                ? theme === 'dark'
                                  ? colors.text.tertiary
                                  : '#9ca3af'
                                : theme === 'dark'
                                  ? '#fafafa'
                                  : '#111827',
                          }}
                        >
                          {cell.getDate()}
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={{ height: 36 }} />
                    )}
                  </View>
                ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Drag ghost: only when coords valid */}
      <Modal
        visible={
          !!dragEvent && !!dragGhostPosition && dragGhostPosition.x > 20 && dragGhostPosition.y > 60
        }
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <View pointerEvents="none" style={{ flex: 1 }}>
          {dragEvent && dragGhostPosition && (
            <View
              style={{
                position: 'absolute',
                left: Math.max(8, Math.min(dragGhostPosition.x - 50, 9999)),
                top: Math.max(8, dragGhostPosition.y - 16),
                width: 100,
                minHeight: 32,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 6,
                justifyContent: 'center',
                backgroundColor: dragEvent.color + 'E6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 8,
              }}
            >
              <Text
                className="text-[11px] font-medium text-gray-900 dark:text-gray-100"
                numberOfLines={1}
              >
                {dragEvent.title}
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Conflict modal — Phase 2-4: rounded-[20px], design-system */}
      <Modal
        visible={conflictModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConflictModal((p) => ({ ...p, visible: false }))}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center p-6"
          onPress={() => setConflictModal((p) => ({ ...p, visible: false }))}
          accessibilityLabel="Close"
        >
          <Pressable
            className="rounded-[20px] p-6 max-w-md w-full mx-auto shadow-xl border"
            style={{
              backgroundColor:
                theme === 'dark' ? colors.surface.cardElevated : colors.surface.cardLight,
              borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              className="text-lg font-bold mb-2"
              style={{
                color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                fontFamily: fontFamily.bold,
              }}
            >
              {t.calendar.conflictTitle}
            </Text>
            <Text
              className="text-[14px] mb-4"
              style={{
                color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                fontFamily: fontFamily.regular,
              }}
            >
              {conflictModal.otherTitle
                ? t.calendar.conflictMessageWithTitle.replace('{title}', conflictModal.otherTitle)
                : t.calendar.conflictMessage}
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 min-h-[48px] items-center justify-center rounded-xl border"
                style={{
                  borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                }}
                onPress={() => {
                  setConflictModal((p) => ({ ...p, visible: false }));
                  setMovingEventId(null);
                  setDropTarget(null);
                }}
                accessibilityLabel={t.calendar.conflictCancel}
              >
                <Text
                  className="text-[14px] font-semibold"
                  style={{
                    color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                    fontFamily: fontFamily.medium,
                  }}
                >
                  {t.calendar.conflictCancel}
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 min-h-[48px] items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.brand.primary }}
                onPress={() => {
                  if (conflictModal.eventId) {
                    updateEventTime(
                      conflictModal.eventId,
                      conflictModal.newStart,
                      conflictModal.newEnd
                    );
                  }
                  setConflictModal((p) => ({ ...p, visible: false }));
                }}
                accessibilityLabel={t.calendar.conflictMoveHere}
              >
                <Text
                  className="text-[14px] font-semibold text-white"
                  style={{ fontFamily: fontFamily.medium }}
                >
                  {t.calendar.conflictMoveHere}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
