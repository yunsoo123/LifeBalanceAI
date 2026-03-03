import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyState, Skeleton, SkeletonCard, ChatBubble, ResultCard } from '@/components/ui';
import { RealityCheckBadge } from '@/components/ui';
import { supabase, tables } from '@/lib/supabase/client';
import { getApiBase, API_SETUP_HINT } from '@/lib/apiUrl';
import { getStartOfWeek } from '@/lib/weekUtils';
import { checkLimit, incrementUsage, FREE_TIER_LIMITS } from '@/lib/usageLimits';
import { useSubscription } from '@/lib/useSubscription';
import { useI18n } from '@/lib/i18n';
import { useToastContext } from '@/lib/ToastContext';
import { useNetStatus } from '@/lib/useNetStatus';
import { CONTENT_MAX_WIDTH, LAYOUT } from '@/lib/layoutConstants';
import { useTheme } from '@/lib/ThemeContext';
import {
  colors,
  getSurface,
  fontFamily,
  typography,
  spacing,
  borderRadius,
} from '@/lib/design-system';

/** 0=Mon..6=Sun; preferredStartMinutes 0..1440 (from AI when user says e.g. "금요일 오전"). */
type ScheduleActivity = {
  name: string;
  hoursPerWeek: number;
  optimalTime: string;
  preferredDayOfWeek?: number;
  preferredStartMinutes?: number;
};

type ScheduleResult = {
  activities: ScheduleActivity[];
  totalHours: number;
  feasible: boolean;
  suggestions: string[];
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

/** Track 3: override per activity index. dayOfWeek 0=Mon..6=Sun, startMinutes 0..1440 */
type TimeOverride = { dayOfWeek: number; startMinutes: number };
type OverridesMap = Record<number, TimeOverride>;

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

/** Effective slot for one activity. Uses user override, else AI preferred day/time, else default (0=Mon, 9:00+offset). */
function getEffectiveSlot(
  schedule: ScheduleResult,
  overrides: OverridesMap,
  index: number
): { dayOfWeek: number; startMinutes: number; durationMinutes: number } {
  const activity = schedule.activities[index];
  if (!activity) return { dayOfWeek: 0, startMinutes: 540, durationMinutes: 30 };
  const durationMinutes = Math.max(30, Math.round((activity.hoursPerWeek / 7) * 60));
  const ov = overrides[index];
  if (ov) return { dayOfWeek: ov.dayOfWeek, startMinutes: ov.startMinutes, durationMinutes };
  const preferredDay = activity.preferredDayOfWeek;
  const preferredStart = activity.preferredStartMinutes;
  if (typeof preferredDay === 'number' && preferredDay >= 0 && preferredDay <= 6) {
    return {
      dayOfWeek: preferredDay,
      startMinutes:
        typeof preferredStart === 'number' && preferredStart >= 0 && preferredStart <= 1440
          ? preferredStart
          : 9 * 60,
      durationMinutes,
    };
  }
  let offsetMinutes = 0;
  for (let j = 0; j < index; j++) {
    const d = Math.max(30, Math.round((schedule.activities[j].hoursPerWeek / 7) * 60));
    offsetMinutes += d + 60;
  }
  return {
    dayOfWeek: index % 7,
    startMinutes: 9 * 60 + offsetMinutes,
    durationMinutes,
  };
}

/** True if (dayOfWeek, startMinutes, durationMinutes) conflicts with any other activity (excluding exceptIndex). */
function hasScheduleConflict(
  schedule: ScheduleResult,
  overrides: OverridesMap,
  exceptIndex: number,
  dayOfWeek: number,
  startMinutes: number,
  durationMinutes: number
): boolean {
  const endMinutes = startMinutes + durationMinutes;
  for (let i = 0; i < schedule.activities.length; i++) {
    if (i === exceptIndex) continue;
    const slot = getEffectiveSlot(schedule, overrides, i);
    if (slot.dayOfWeek !== dayOfWeek) continue;
    const a1 = startMinutes;
    const a2 = endMinutes;
    const b1 = slot.startMinutes;
    const b2 = slot.startMinutes + slot.durationMinutes;
    if (a1 < b2 && b1 < a2) return true;
  }
  return false;
}

const ACTIVITY_ICON_BG = ['bg-blue-950/60', 'bg-violet-950/60', 'bg-amber-950/60'];

const MAX_TURNS = 6;

/** 30-min slots from 6:00 to 22:00 (minutes from midnight) */
const TIME_SLOTS = Array.from({ length: 33 }, (_, i) => 360 + i * 30);

function formatTimeSlot(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

function TimeEditModal({
  visible,
  activityName,
  initialDayOfWeek,
  initialStartMinutes,
  onApply,
  onCancel,
}: {
  visible: boolean;
  activityName: string;
  initialDayOfWeek: number;
  initialStartMinutes: number;
  onApply: (dayOfWeek: number, startMinutes: number) => void;
  onCancel: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedDay, setSelectedDay] = useState(initialDayOfWeek);
  const [selectedStart, setSelectedStart] = useState(initialStartMinutes);
  const modalBg = isDark ? colors.surface.cardElevated : colors.surface.cardLight;
  const borderColor = isDark ? colors.border.subtle : colors.border.subtleLight;
  const slotSelected = colors.brand.primary;
  const slotDefault = isDark ? colors.surface.input : colors.border.subtleLight;
  const textPrimary = isDark ? colors.text.primary : colors.text.primaryLight;
  const textSecondary = isDark ? colors.text.secondary : colors.text.secondaryLight;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          padding: spacing.lg,
        }}
        onPress={onCancel}
        accessibilityLabel="Close"
      >
        <Pressable
          style={{
            backgroundColor: modalBg,
            borderWidth: 1,
            borderColor,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            maxWidth: 400,
            width: '100%',
            alignSelf: 'center',
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            className="text-lg font-bold mb-1"
            style={{ color: textPrimary, fontFamily: fontFamily.bold }}
          >
            {activityName}
          </Text>
          <Text
            className="text-[13px] mb-4"
            style={{ color: textSecondary, fontFamily: fontFamily.regular }}
          >
            요일 · 시작 시간
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {DAY_LABELS.map((label, i) => (
              <Pressable
                key={i}
                onPress={() => setSelectedDay(i)}
                className="min-h-[44px] min-w-[44px] px-3 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: selectedDay === i ? slotSelected : slotDefault,
                }}
                accessibilityLabel={`${label} 선택`}
                accessibilityRole="button"
              >
                <Text
                  className="text-[13px] font-medium"
                  style={{ color: selectedDay === i ? '#ffffff' : textPrimary }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          <ScrollView style={{ maxHeight: 200 }} className="mb-4">
            <View className="flex-row flex-wrap gap-2">
              {TIME_SLOTS.map((mins) => (
                <Pressable
                  key={mins}
                  onPress={() => setSelectedStart(mins)}
                  className="min-h-[44px] min-w-[44px] px-2 rounded-lg items-center justify-center"
                  style={{
                    backgroundColor:
                      selectedStart === mins
                        ? slotSelected
                        : isDark
                          ? colors.border.subtle
                          : colors.gray[100],
                  }}
                  accessibilityLabel={`${formatTimeSlot(mins)} 선택`}
                  accessibilityRole="button"
                >
                  <Text
                    className="text-[12px]"
                    style={{ color: selectedStart === mins ? '#ffffff' : textPrimary }}
                  >
                    {formatTimeSlot(mins)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 min-h-[48px] rounded-xl border items-center justify-center"
              style={{ borderColor }}
              accessibilityLabel="취소"
              accessibilityRole="button"
            >
              <Text
                className="text-[14px] font-semibold"
                style={{ color: textSecondary, fontFamily: fontFamily.medium }}
              >
                취소
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onApply(selectedDay, selectedStart)}
              className="flex-1 min-h-[48px] rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.brand.primary }}
              accessibilityLabel="적용"
              accessibilityRole="button"
            >
              <Text
                className="text-[14px] font-semibold text-white"
                style={{ fontFamily: fontFamily.medium }}
              >
                적용
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t, lang } = useI18n();
  const isOnline = useNetStatus();
  const { isPro } = useSubscription();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [addToCalendarLoading, setAddToCalendarLoading] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<ScheduleResult | null>(null);
  const [error, setError] = useState<string>('');
  const [overrides, setOverrides] = useState<OverridesMap>({});
  const [timeEditActivityIndex, setTimeEditActivityIndex] = useState<number | null>(null);
  const [showTimeEditModal, setShowTimeEditModal] = useState(false);
  const [placementModalVisible, setPlacementModalVisible] = useState(false);
  const { showSuccess } = useToastContext();

  const saveSchedule = useCallback(async () => {
    if (!schedule) return;
    setSaveLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t.common.signInRequiredTitle, t.auth.signInRequiredToAddToCalendar, [
          { text: t.common.cancel, style: 'cancel' },
          { text: t.auth.signIn, onPress: () => router.replace('/sign-in') },
        ]);
        setSaveLoading(false);
        return;
      }

      const { error: insertError } = await tables
        .schedules()
        .insert({
          user_id: user.id,
          activities_json: schedule.activities,
          total_hours: schedule.totalHours,
          feasible: schedule.feasible ?? true,
          suggestions: Array.isArray(schedule.suggestions) ? schedule.suggestions : [],
          week_start_date: getStartOfWeek(),
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Save failed:', insertError);
        Alert.alert(
          t.common.saveFailed,
          !isOnline
            ? t.common.offlineSaveMessage
            : insertError.message || t.schedule.saveFailedMessage,
          [
            { text: t.common.ok, style: 'cancel' },
            { text: t.common.retry, onPress: () => saveSchedule() },
          ]
        );
        setSaveLoading(false);
        return;
      }

      Alert.alert(t.common.ok, t.schedule.saveSuccess);
    } catch (err) {
      console.error('Save failed:', err);
      Alert.alert(
        t.common.saveFailed,
        !isOnline
          ? t.common.offlineSaveMessage
          : err instanceof Error
            ? err.message
            : t.schedule.saveFailedMessage,
        [
          { text: t.common.ok, style: 'cancel' },
          { text: t.common.retry, onPress: () => saveSchedule() },
        ]
      );
    } finally {
      setSaveLoading(false);
    }
  }, [schedule, router]);

  type PlacementType = 'calendar' | 'todo' | 'both';

  const addToCalendarWithPlacement = useCallback(
    async (placement: PlacementType) => {
      if (!schedule || schedule.activities.length === 0) return;
      setPlacementModalVisible(false);
      setAddToCalendarLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert(t.common.signInRequiredTitle, t.auth.signInRequiredToAddToCalendar, [
            { text: t.common.cancel, style: 'cancel' },
            {
              text: t.auth.signIn,
              onPress: () => router.replace('/sign-in'),
            },
          ]);
          setAddToCalendarLoading(false);
          return;
        }

        const weekStart = getStartOfWeek();
        const weekStartDate = new Date(weekStart + 'T00:00:00');
        const optimalTimeToColor = (opt: string) =>
          opt === 'morning' ? '#10B981' : opt === 'afternoon' ? '#F59E0B' : '#6366F1';

        let eventCount = 0;
        let todoCount = 0;

        if (placement === 'calendar' || placement === 'both') {
          for (let i = 0; i < schedule.activities.length; i++) {
            const activity = schedule.activities[i];
            const slot = getEffectiveSlot(schedule, overrides, i);
            const startDate = new Date(weekStartDate);
            startDate.setDate(weekStartDate.getDate() + slot.dayOfWeek);
            startDate.setHours(0, 0, 0, 0);
            startDate.setMinutes(slot.startMinutes);
            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + slot.durationMinutes);
            const { error: evError } = await tables.events().insert({
              user_id: user.id,
              title: activity.name.trim(),
              description: 'From AI Schedule',
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString(),
              all_day: false,
              color: optimalTimeToColor(activity.optimalTime ?? 'flexible'),
            });
            if (!evError) eventCount++;
          }
        }

        if (placement === 'todo' || placement === 'both') {
          for (const activity of schedule.activities) {
            const { error } = await tables.todos().insert({
              user_id: user.id,
              title: activity.name.trim(),
            });
            if (!error) todoCount++;
          }
        }

        if (placement === 'calendar' && eventCount > 0) {
          showSuccess(
            lang === 'ko' ? '캘린더에 추가됨' : 'Added to calendar',
            lang === 'ko'
              ? `캘린더에 ${eventCount}개 일정이 추가되었어요.`
              : `${eventCount} events added.`
          );
        } else if (placement === 'todo' && todoCount > 0) {
          showSuccess(
            t.capture.todoSuccess,
            lang === 'ko' ? `${todoCount}개 할 일이 추가되었어요.` : `${todoCount} to-dos added.`
          );
        } else if (placement === 'both' && (eventCount > 0 || todoCount > 0)) {
          showSuccess(t.capture.bothSuccess, '');
        }
        router.push(`/(tabs)/calendar?focusWeek=${encodeURIComponent(weekStart)}`);
      } catch (err) {
        console.error('Add to calendar failed:', err);
        Alert.alert(
          lang === 'ko' ? '오류' : 'Error',
          err instanceof Error
            ? err.message
            : lang === 'ko'
              ? '캘린더 추가에 실패했어요.'
              : 'Failed to add.'
        );
      } finally {
        setAddToCalendarLoading(false);
      }
    },
    [schedule, overrides, router, lang, t, showSuccess]
  );

  const addToCalendar = useCallback(() => {
    if (!schedule || schedule.activities.length === 0) {
      Alert.alert(
        lang === 'ko' ? '안내' : 'Info',
        lang === 'ko' ? '먼저 일정을 생성해 주세요.' : 'Generate a schedule first.'
      );
      return;
    }
    setPlacementModalVisible(true);
  }, [schedule, lang]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const canUse = await checkLimit('schedules', isPro);
    if (!canUse) {
      Alert.alert(
        t.common.limitReachedTitle,
        t.common.limitReachedSchedule.replace('{n}', String(FREE_TIER_LIMITS.schedulesPerMonth))
      );
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    if (nextMessages.length > MAX_TURNS * 2) {
      setError(lang === 'ko' ? '대화 턴 수를 초과했어요. 새로 시작해 주세요.' : 'Too many turns.');
      return;
    }

    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${getApiBase()}/api/schedule/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = (data as { error?: string }).error;
        throw new Error(
          msg ||
            (lang === 'ko'
              ? '일정 대화에 실패했어요. 다시 시도해 주세요.'
              : 'Something went wrong. Please try again.')
        );
      }

      const result = data as
        | { type: 'question'; content: string }
        | { type: 'schedule'; data: ScheduleResult };
      if (result.type === 'question') {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content }]);
      } else {
        const scheduleData = result.data;
        if (!scheduleData || !Array.isArray(scheduleData.activities)) {
          throw new Error(
            lang === 'ko' ? '응답 형식이 올바르지 않아요.' : 'Invalid schedule response'
          );
        }
        await incrementUsage('schedules');
        setSchedule(scheduleData);
        setOverrides({});
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              lang === 'ko'
                ? '일정을 만들었어요. 아래 카드를 확인하고 캘린더에 등록해 보세요.'
                : "I've created your schedule. Check the card below and add to calendar.",
          },
        ]);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        typeof errMsg === 'string' &&
        (errMsg.toLowerCase().includes('fetch') || errMsg.toLowerCase().includes('network'))
      ) {
        setError(
          lang === 'ko'
            ? '연결을 확인하고 다시 시도해 주세요.'
            : 'Check your connection and try again.'
        );
      } else {
        setError(
          errMsg ||
            (lang === 'ko'
              ? '일정 대화에 실패했어요. 잠시 후 다시 시도해 주세요.'
              : 'Something went wrong. Please try again.')
        );
      }
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, lang, isPro]);

  const insets = useSafeAreaInsets();
  const INPUT_BAR_HEIGHT = 60;
  const bottomPadding = Math.max(insets.bottom, 6) + INPUT_BAR_HEIGHT + 8;
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (messages.length > 0 || schedule) {
      const t1 = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400);
      const t2 = schedule
        ? setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 700)
        : undefined;
      return () => {
        clearTimeout(t1);
        if (t2) clearTimeout(t2);
      };
    }
    return undefined;
  }, [messages.length, schedule]);

  const freeHours = schedule ? Math.max(0, 168 - schedule.totalHours) : undefined;
  const realityVariant = schedule ? (schedule.feasible !== false ? 'safe' : 'risk') : 'pending';

  const screenBg = getSurface('screen', theme);
  const headerBg = getSurface('card', theme);
  const headerBorder = theme === 'dark' ? colors.border.subtle : colors.border.subtleLight;
  const titleColor = theme === 'dark' ? colors.text.primary : colors.text.primaryLight;
  const captionColor = theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: screenBg }}
      className={`flex-1 ${LAYOUT.screenBg}`}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <View className="flex-1">
          {/* 헤더: 캡션 + 제목 + 메뉴 (design-system 일관) */}
          <View
            style={{
              backgroundColor: headerBg,
              borderBottomWidth: 1,
              borderBottomColor: headerBorder,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: spacing.sm,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  style={{
                    fontSize: typography.fontSize.caption,
                    color: captionColor,
                    fontFamily: fontFamily.medium,
                  }}
                >
                  {t.schedule.subtitle}
                </Text>
                <Text
                  style={{
                    fontSize: typography.fontSize.titleLarge,
                    fontFamily: fontFamily.bold,
                    color: titleColor,
                    marginTop: 4,
                  }}
                >
                  {t.schedule.title}
                </Text>
              </View>
              <Pressable
                className="p-2 -mr-2 min-w-[44px] min-h-[44px] items-center justify-center"
                accessibilityLabel={lang === 'ko' ? '메뉴' : 'Menu'}
                accessibilityRole="button"
              >
                <Text style={{ fontSize: 18, color: titleColor }}>⋯</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            style={{ backgroundColor: screenBg }}
            contentContainerStyle={{
              maxWidth: CONTENT_MAX_WIDTH,
              alignSelf: 'center',
              width: '100%',
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: bottomPadding,
              gap: spacing.lg,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* 대화 스레드: 말풍선만 (카톡형) — 말풍선 사이 간격 확대 */}
            <View style={{ gap: 24 }}>
              {messages.map((msg, idx) => (
                <ChatBubble key={`${msg.role}-${idx}`} type={msg.role === 'user' ? 'user' : 'ai'}>
                  {msg.content}
                </ChatBubble>
              ))}
            </View>

            {/* 현실성 검증: AI 메시지 옆 작은 카드 (오른쪽 정렬) */}
            {(messages.length > 0 || schedule) && (
              <View className="self-end">
                <RealityCheckBadge variant={realityVariant} lang={lang} />
              </View>
            )}

            {/* 결과는 채팅 안 한 카드 블록으로 삽입 */}
            {schedule && (
              <View className="mb-4 gap-5">
                <ResultCard
                  totalHours={schedule.totalHours}
                  totalMax={168}
                  safe={schedule.feasible ?? true}
                  freeHours={freeHours}
                  onAddToCalendar={addToCalendar}
                  addToCalendarLoading={addToCalendarLoading}
                />

                <View
                  style={{
                    backgroundColor: isDark
                      ? colors.surface.cardElevated
                      : colors.surface.cardElevatedLight,
                    borderWidth: 1,
                    borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
                    borderRadius: borderRadius.xl,
                    overflow: 'hidden',
                  }}
                >
                  <View className="flex flex-col">
                    {schedule.activities.map((activity, index) => {
                      const slot = getEffectiveSlot(schedule, overrides, index);
                      const timeBlockText = `${DAY_LABELS[slot.dayOfWeek]} · ${formatTimeSlot(slot.startMinutes)}`;
                      return (
                        <View
                          key={`${activity.name}-${index}`}
                          className="flex flex-row items-center gap-3.5 border-b px-5 py-3.5"
                          style={{
                            borderBottomColor: isDark
                              ? colors.border.subtle
                              : colors.border.subtleLight,
                          }}
                        >
                          <View
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ACTIVITY_ICON_BG[index % ACTIVITY_ICON_BG.length]}`}
                          >
                            <Text className="text-lg">
                              {index % 3 === 0 ? '📋' : index % 3 === 1 ? '📖' : '⚙️'}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-base font-semibold"
                              style={{ color: isDark ? '#f3f4f6' : colors.gray[900] }}
                            >
                              {activity.name}
                            </Text>
                            <Text
                              className="text-[14px] font-semibold mt-0.5"
                              style={{ color: isDark ? '#a78bfa' : colors.brand.primary }}
                            >
                              {timeBlockText}
                            </Text>
                            <Text
                              className="text-[13px] mt-0.5"
                              style={{ color: isDark ? '#9ca3af' : colors.gray[500] }}
                            >
                              {activity.hoursPerWeek}h/week · {activity.optimalTime}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Pressable
                              onPress={() => {
                                setTimeEditActivityIndex(index);
                                setShowTimeEditModal(true);
                              }}
                              className="min-h-[44px] min-w-[44px] items-center justify-center mt-1 rounded-lg border border-zinc-600"
                              accessibilityLabel={lang === 'ko' ? '시간 변경' : 'Change time'}
                            >
                              <Text
                                className="text-[12px] font-medium"
                                style={{ color: '#a78bfa' }}
                              >
                                {lang === 'ko' ? '시간 변경' : 'Time'}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {schedule.suggestions.length > 0 && (
                    <View
                      style={{
                        marginHorizontal: 16,
                        marginTop: 12,
                        marginBottom: 16,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 10,
                        borderRadius: 12,
                        backgroundColor:
                          theme === 'dark' ? colors.surface.input : colors.surface.subtleLight,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                      }}
                    >
                      <View className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/80">
                        <Text className="text-[10px] text-white">⚡</Text>
                      </View>
                      <Text
                        className="flex-1 text-[13px] leading-relaxed"
                        style={{ color: '#d1d5db' }}
                      >
                        {schedule.suggestions[0]}
                      </Text>
                    </View>
                  )}

                  <View className="px-4 pb-5 pt-2">
                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={saveSchedule}
                        disabled={saveLoading}
                        className="flex-1 min-h-[48px] rounded-xl border border-zinc-600 flex-row justify-center items-center"
                        accessibilityRole="button"
                        accessibilityLabel={
                          saveLoading ? t.schedule.saving : t.schedule.saveSchedule
                        }
                      >
                        <Text className="text-[13px] font-semibold" style={{ color: '#d1d5db' }}>
                          {saveLoading ? t.schedule.saving : t.schedule.saveSchedule}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setSchedule(null);
                          setMessages([]);
                          setOverrides({});
                        }}
                        className="min-h-[48px] min-w-[48px] rounded-xl border border-zinc-600 items-center justify-center"
                        accessibilityRole="button"
                        accessibilityLabel="다시 만들기"
                      >
                        <Text className="text-base" style={{ color: '#9ca3af' }}>
                          ↻
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Reality check badge 제거 — 위로 이동함 */}

            {loading && (
              <View className="gap-4">
                <SkeletonCard />
                <View className="mt-3">
                  <Skeleton variant="text" width="60%" height={16} className="mb-2" />
                  <Skeleton variant="text" width="80%" height={16} />
                </View>
              </View>
            )}

            {!loading && !schedule && messages.length === 0 && !error && (
              <View className="mt-2">
                <EmptyState
                  icon={<Text className="text-4xl">📋</Text>}
                  dark={isDark}
                  title={t.schedule.emptyTitle}
                  description={t.schedule.emptyDesc}
                />
              </View>
            )}

            {error && (
              <View
                className="rounded-2xl border border-red-900/50 p-5 shadow-sm"
                style={{
                  backgroundColor: 'rgba(127, 29, 29, 0.3)',
                  borderColor: 'rgba(185, 28, 28, 0.5)',
                }}
              >
                <Text className="mb-2 text-base font-semibold" style={{ color: '#f87171' }}>
                  {t.common.error ?? 'Generation Failed'}
                </Text>
                <Text
                  className="text-[15px] leading-relaxed"
                  style={{
                    color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                  }}
                >
                  {error}
                </Text>
                {/network|connection|request failed/i.test(error) && (
                  <Text className="mt-2 text-[13px]" style={{ color: '#9ca3af' }}>
                    {API_SETUP_HINT}
                  </Text>
                )}
                <Pressable
                  onPress={() => setError('')}
                  className="mt-4 min-h-[44px] min-w-[44px] justify-center items-center"
                  accessibilityLabel="Try again"
                  accessibilityRole="button"
                >
                  <Text className="text-[13px] font-semibold" style={{ color: '#d1d5db' }}>
                    Try Again
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>

          {/* 하단 고정 입력창 — 전송 버튼 터치 영역 넉넉히, design-system */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingHorizontal: spacing.md,
              paddingTop: 10,
              paddingBottom: Math.max(insets.bottom, 8),
              minHeight: 64,
              backgroundColor: getSurface('card', theme),
              borderTopWidth: 1,
              borderTopColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
            }}
          >
            <Pressable
              style={{
                width: 48,
                height: 48,
                borderRadius: borderRadius.lg,
                backgroundColor: getSurface('input', theme),
                borderWidth: 1,
                borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel={lang === 'ko' ? '첨부' : 'Attach'}
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontSize: 20,
                  color: theme === 'dark' ? colors.text.secondary : colors.text.tertiary,
                  fontFamily: fontFamily.medium,
                }}
              >
                +
              </Text>
            </Pressable>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                minHeight: 52,
                maxHeight: 120,
                paddingHorizontal: spacing.md,
                borderRadius: borderRadius.lg,
                backgroundColor: getSurface('input', theme),
                borderWidth: 1,
                borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
              }}
            >
              <TextInput
                placeholder={lang === 'ko' ? '메시지를 입력하세요...' : 'Type a message...'}
                placeholderTextColor={colors.text.tertiary}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
                style={{
                  flex: 1,
                  fontSize: typography.fontSize.body,
                  lineHeight: 24,
                  color: theme === 'dark' ? colors.chat.aiBubbleText : colors.text.primaryLight,
                  fontFamily: fontFamily.regular,
                  minHeight: 44,
                  maxHeight: 96,
                  paddingVertical: 12,
                }}
                textAlignVertical="center"
              />
            </View>
            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || loading}
              style={{
                minHeight: 56,
                minWidth: 56,
                borderRadius: borderRadius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  !input.trim() || loading
                    ? theme === 'dark'
                      ? colors.surface.input
                      : colors.border.subtleLight
                    : colors.brand.primary,
              }}
              accessibilityLabel={loading ? t.schedule.generating : t.schedule.generate}
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: fontFamily.bold,
                  color: !input.trim() || loading ? colors.text.tertiary : '#fff',
                }}
              >
                {loading ? '…' : '➤'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {showTimeEditModal && schedule && timeEditActivityIndex !== null && (
        <TimeEditModal
          key={`time-edit-${timeEditActivityIndex}-${getEffectiveSlot(schedule, overrides, timeEditActivityIndex).dayOfWeek}-${getEffectiveSlot(schedule, overrides, timeEditActivityIndex).startMinutes}`}
          visible={showTimeEditModal}
          activityName={schedule.activities[timeEditActivityIndex]?.name ?? ''}
          initialDayOfWeek={getEffectiveSlot(schedule, overrides, timeEditActivityIndex).dayOfWeek}
          initialStartMinutes={
            getEffectiveSlot(schedule, overrides, timeEditActivityIndex).startMinutes
          }
          onApply={(dayOfWeek, startMinutes) => {
            const durationMinutes = getEffectiveSlot(
              schedule,
              overrides,
              timeEditActivityIndex
            ).durationMinutes;
            if (
              hasScheduleConflict(
                schedule,
                overrides,
                timeEditActivityIndex,
                dayOfWeek,
                startMinutes,
                durationMinutes
              )
            ) {
              Alert.alert(
                lang === 'ko' ? '시간 충돌' : 'Time conflict',
                lang === 'ko'
                  ? '이 시간대에 이미 다른 활동이 있어요. 다른 요일이나 시간을 선택해 주세요.'
                  : 'This slot overlaps with another activity. Please choose a different day or time.'
              );
              return;
            }
            setOverrides((prev) => ({
              ...prev,
              [timeEditActivityIndex]: { dayOfWeek, startMinutes },
            }));
            setShowTimeEditModal(false);
            setTimeEditActivityIndex(null);
          }}
          onCancel={() => {
            setShowTimeEditModal(false);
            setTimeEditActivityIndex(null);
          }}
        />
      )}

      <Modal visible={placementModalVisible} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setPlacementModalVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: getSurface('card', theme),
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 24,
              paddingBottom: 48,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: fontFamily.medium,
                color: isDark ? colors.text.primary : colors.text.primaryLight,
                marginBottom: 16,
              }}
            >
              {lang === 'ko' ? '어디에 추가할까요?' : 'Where to add?'}
            </Text>
            {(['calendar', 'todo', 'both'] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => addToCalendarWithPlacement(p)}
                disabled={addToCalendarLoading}
                style={{
                  minHeight: 48,
                  borderRadius: 12,
                  backgroundColor: getSurface('input', theme),
                  borderWidth: 1,
                  borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: fontFamily.medium,
                    color: isDark ? colors.text.primary : colors.text.primaryLight,
                  }}
                >
                  {p === 'calendar' && (lang === 'ko' ? '일정에만 추가' : 'Add to calendar only')}
                  {p === 'todo' && (lang === 'ko' ? '할 일만 추가' : 'Add to to-do only')}
                  {p === 'both' && (lang === 'ko' ? '일정 + 할 일 둘 다' : 'Add to both')}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setPlacementModalVisible(false)}
              style={{
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 15, color: colors.text.tertiary }}>{t.common.cancel}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
