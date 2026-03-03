import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';
import {
  colors,
  getSurface,
  getBrand,
  fontFamily,
  typography,
  spacing,
  borderRadius,
} from '@/lib/design-system';
import { supabase, tables } from '@/lib/supabase/client';
import { getApiBase } from '@/lib/apiUrl';
import { checkLimit, incrementUsage, FREE_TIER_LIMITS } from '@/lib/usageLimits';
import { useSubscription } from '@/lib/useSubscription';
import { useI18n } from '@/lib/i18n';
import { useToastContext } from '@/lib/ToastContext';
import { getStartOfWeek } from '@/lib/weekUtils';
import { useNetStatus } from '@/lib/useNetStatus';
import { Button, Spinner, TimeWheelPicker } from '@/components/ui';
import { getLocaleFromLang } from '@/lib/formatByLang';
import type { ParsedScheduleEvent } from '@/lib/ai/parse-schedule';

type Placement = 'calendar' | 'todo' | 'both';

export default function CaptureIndexScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const { showSuccess } = useToastContext();
  const { isPro } = useSubscription();
  const isOnline = useNetStatus();
  const [quickAdd, setQuickAdd] = useState('');
  const [placementModalVisible, setPlacementModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datetimeModalVisible, setDatetimeModalVisible] = useState(false);
  const [pendingPlacement, setPendingPlacement] = useState<Placement | null>(null);
  const [eventDate, setEventDate] = useState<Date>(() => new Date());
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventEndTime, setEventEndTime] = useState('10:00');
  const isDark = theme === 'dark';

  const locale = getLocaleFromLang(lang);

  const handleSaveWithPlacement = useCallback(
    async (
      placement: Placement,
      eventDateTime?: { date: Date; startTime: string; endTime: string }
    ) => {
      const text = quickAdd.trim();
      if (!text) return;
      setPlacementModalVisible(false);
      setDatetimeModalVisible(false);
      setPendingPlacement(null);
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setLoading(false);
        Alert.alert(t.common.signInRequiredTitle, t.common.signInRequiredToSave, [
          { text: t.common.ok, style: 'cancel' },
          {
            text: t.auth.signIn,
            onPress: () => router.replace('/sign-in'),
          },
        ]);
        return;
      }

      try {
        let eventCount = 0;
        let todoCount = 0;

        if (placement === 'todo' || placement === 'both') {
          const { error } = await tables.todos().insert({
            user_id: user.id,
            title: text,
          });
          if (!error) todoCount++;
        }

        if (placement === 'calendar' || placement === 'both') {
          const canUse = await checkLimit('parses', isPro);
          if (!canUse) {
            Alert.alert(
              t.common.limitReachedTitle,
              t.common.limitReachedParse.replace('{n}', String(FREE_TIER_LIMITS.parsesPerMonth))
            );
            setLoading(false);
            return;
          }
          const parseRes = await fetch(`${getApiBase()}/api/inbox/parse-schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          const parseData = await parseRes.json().catch(() => ({}));
          if (!parseRes.ok) {
            throw new Error((parseData as { error?: string }).error || `HTTP ${parseRes.status}`);
          }
          const events = (parseData as { events?: ParsedScheduleEvent[] }).events;
          if (!Array.isArray(events) || events.length < 1) {
            throw new Error(
              lang === 'ko'
                ? '이 내용으로는 일정을 만들 수 없어요.'
                : 'Could not create events from this text.'
            );
          }
          await incrementUsage('parses');

          if (eventDateTime) {
            const [sh, sm] = eventDateTime.startTime.split(':').map(Number);
            const [eh, em] = eventDateTime.endTime.split(':').map(Number);
            const startDate = new Date(eventDateTime.date);
            startDate.setHours(isNaN(sh) ? 9 : sh, isNaN(sm) ? 0 : sm, 0, 0);
            const endDate = new Date(eventDateTime.date);
            endDate.setHours(isNaN(eh) ? 10 : eh, isNaN(em) ? 0 : em, 0, 0);
            const title = events[0]?.title ?? text;
            const { error } = await tables.events().insert({
              user_id: user.id,
              title,
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString(),
              all_day: false,
              color: colors.brand.primary,
            });
            if (!error) eventCount = 1;
          } else {
            const weekStart = getStartOfWeek(new Date());
            const scheduleRes = await fetch(`${getApiBase()}/api/inbox/auto-schedule`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ parsedEvents: events, weekStart }),
            });
            const scheduleData = await scheduleRes.json().catch(() => ({}));
            if (!scheduleRes.ok) {
              throw new Error(
                (scheduleData as { error?: string }).error || `HTTP ${scheduleRes.status}`
              );
            }
            const { eventsToCreate } = scheduleData as {
              eventsToCreate?: {
                title: string;
                start_time: string;
                end_time: string;
                color: string;
              }[];
            };
            if (Array.isArray(eventsToCreate)) {
              for (const ev of eventsToCreate) {
                const { error } = await tables.events().insert({
                  user_id: user.id,
                  title: ev.title,
                  start_time: ev.start_time,
                  end_time: ev.end_time,
                  all_day: false,
                  color: ev.color ?? '#6366F1',
                });
                if (!error) eventCount++;
              }
            }
          }

          if (placement === 'both' && todoCount === 0) {
            await tables.todos().insert({ user_id: user.id, title: text });
            todoCount = 1;
          }
        }

        if (placement === 'calendar' && eventCount > 0) {
          showSuccess(
            t.capture.addSuccess,
            lang === 'ko' ? `${eventCount}개 일정이 추가되었어요.` : `${eventCount} events added.`
          );
        } else if (placement === 'todo' && todoCount > 0) {
          showSuccess(t.capture.todoSuccess, '');
        } else if (placement === 'both' && (eventCount > 0 || todoCount > 0)) {
          showSuccess(t.capture.bothSuccess, '');
        }
        setQuickAdd('');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        Alert.alert(t.common.saveFailed, !isOnline ? t.common.offlineSaveMessage : msg, [
          { text: t.common.ok, style: 'cancel' },
          {
            text: t.common.retry,
            onPress: () => handleSaveWithPlacement(placement, eventDateTime),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [quickAdd, lang, isPro, router, t, showSuccess, isOnline]
  );

  const openPlacementModal = () => {
    if (!quickAdd.trim()) return;
    setPlacementModalVisible(true);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: getSurface('screen', theme) }}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
          <Text
            style={{
              fontSize: typography.fontSize.titleLarge,
              fontFamily: fontFamily.bold,
              color: isDark ? colors.text.primary : colors.text.primaryLight,
            }}
          >
            {t.capture.title}
          </Text>
          <Text
            style={{
              marginTop: 4,
              fontSize: typography.fontSize.small,
              color: isDark ? colors.text.tertiary : colors.text.secondaryLight,
            }}
          >
            {lang === 'ko'
              ? '할 일이나 일정을 적고 저장 위치를 선택하세요.'
              : 'Type a task or schedule, then choose where to save.'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: 80,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: getSurface('card', theme),
              borderWidth: 1,
              borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
            }}
          >
            <TextInput
              style={{
                minHeight: 52,
                paddingHorizontal: spacing.md,
                paddingVertical: 14,
                fontSize: 15,
                color: isDark ? colors.text.primary : colors.text.primaryLight,
                backgroundColor: getSurface('input', theme),
                borderRadius: borderRadius.md,
                borderWidth: 1,
                borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
              }}
              placeholder={t.capture.placeholder}
              placeholderTextColor={colors.text.tertiary}
              value={quickAdd}
              onChangeText={setQuickAdd}
              onSubmitEditing={openPlacementModal}
              returnKeyType="done"
              blurOnSubmit
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <Pressable
                onPress={openPlacementModal}
                disabled={!quickAdd.trim() || loading}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: borderRadius.md,
                  backgroundColor:
                    quickAdd.trim() && !loading ? getBrand('primary', theme) : colors.text.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <Text style={{ fontSize: 15, fontFamily: fontFamily.medium, color: '#fff' }}>
                    {t.capture.save}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/(tabs)/capture/schedule')}
            style={{
              marginTop: spacing.xl,
              minHeight: 52,
              borderRadius: borderRadius.md,
              borderWidth: 1,
              borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
              backgroundColor: getSurface('input', theme),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: fontFamily.medium,
                color: getBrand('primary', theme),
              }}
            >
              ✨ {t.capture.aiSchedule}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={placementModalVisible} transparent animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setPlacementModalVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: getSurface('card', theme),
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              padding: spacing.lg,
              paddingBottom: spacing.xl + 24,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={{
                fontSize: typography.fontSize.body,
                fontFamily: fontFamily.medium,
                color: isDark ? colors.text.primary : colors.text.primaryLight,
                marginBottom: spacing.md,
              }}
            >
              {lang === 'ko' ? '어디에 추가할까요?' : 'Where to add?'}
            </Text>
            {(['calendar', 'todo', 'both'] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  if (p === 'todo') {
                    handleSaveWithPlacement('todo');
                  } else {
                    setPendingPlacement(p);
                    setPlacementModalVisible(false);
                    setEventDate(new Date());
                    setEventStartTime('09:00');
                    setEventEndTime('10:00');
                    setDatetimeModalVisible(true);
                  }
                }}
                style={{
                  minHeight: 48,
                  borderRadius: borderRadius.md,
                  backgroundColor: getSurface('input', theme),
                  borderWidth: 1,
                  borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: fontFamily.medium,
                    color: isDark ? colors.text.primary : colors.text.primaryLight,
                  }}
                >
                  {p === 'calendar' && t.capture.placementCalendarOnly}
                  {p === 'todo' && t.capture.placementTodoOnly}
                  {p === 'both' && t.capture.placementBoth}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setPlacementModalVisible(false)}
              style={{
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: spacing.sm,
              }}
            >
              <Text style={{ fontSize: 15, color: colors.text.tertiary }}>{t.common.cancel}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={datetimeModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
            onPress={() => {
              setDatetimeModalVisible(false);
              setPendingPlacement(null);
            }}
          >
            <Pressable
              style={{
                backgroundColor: getSurface('card', theme),
                borderTopLeftRadius: borderRadius.xl,
                borderTopRightRadius: borderRadius.xl,
                padding: spacing.lg,
                paddingBottom: spacing.xl + 24,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <Text
                style={{
                  fontSize: typography.fontSize.body,
                  fontFamily: fontFamily.medium,
                  color: isDark ? colors.text.primary : colors.text.primaryLight,
                  marginBottom: spacing.md,
                }}
              >
                {lang === 'ko' ? '날짜와 시간을 선택하세요' : 'Choose date and time'}
              </Text>

              <Text
                style={{
                  fontSize: typography.fontSize.small,
                  fontFamily: fontFamily.medium,
                  color: isDark ? colors.text.tertiary : colors.text.secondaryLight,
                  marginBottom: 6,
                }}
              >
                {t.calendar.date}
              </Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}
              >
                <Pressable
                  onPress={() => {
                    const d = new Date(eventDate);
                    d.setDate(d.getDate() - 1);
                    setEventDate(d);
                  }}
                  style={{
                    minHeight: 44,
                    minWidth: 44,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
                    backgroundColor: getSurface('input', theme),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel={t.calendar.prevDay}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: isDark ? colors.text.primary : colors.text.primaryLight,
                    }}
                  >
                    ‹
                  </Text>
                </Pressable>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontFamily: fontFamily.medium,
                    color: isDark ? colors.text.primary : colors.text.primaryLight,
                    textAlign: 'center',
                  }}
                >
                  {eventDate.toLocaleDateString(locale, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Pressable
                  onPress={() => {
                    const d = new Date(eventDate);
                    d.setDate(d.getDate() + 1);
                    setEventDate(d);
                  }}
                  style={{
                    minHeight: 44,
                    minWidth: 44,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: isDark ? colors.border.subtle : colors.border.subtleLight,
                    backgroundColor: getSurface('input', theme),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel={t.calendar.nextDay}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: isDark ? colors.text.primary : colors.text.primaryLight,
                    }}
                  >
                    ›
                  </Text>
                </Pressable>
              </View>

              <Text
                style={{
                  fontSize: typography.fontSize.small,
                  fontFamily: fontFamily.medium,
                  color: isDark ? colors.text.tertiary : colors.text.secondaryLight,
                  marginBottom: 6,
                }}
              >
                {t.calendar.startTime}
              </Text>
              <TimeWheelPicker
                value={eventStartTime}
                onChange={setEventStartTime}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />
              <Text
                style={{
                  fontSize: typography.fontSize.small,
                  fontFamily: fontFamily.medium,
                  color: isDark ? colors.text.tertiary : colors.text.secondaryLight,
                  marginBottom: 6,
                  marginTop: spacing.sm,
                }}
              >
                {t.calendar.endTime}
              </Text>
              <TimeWheelPicker
                value={eventEndTime}
                onChange={setEventEndTime}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 min-h-[48px]"
                  onPress={() => {
                    setDatetimeModalVisible(false);
                    setPendingPlacement(null);
                  }}
                  accessibilityLabel={t.common.cancel}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1 min-h-[48px]"
                  onPress={() => {
                    if (pendingPlacement) {
                      const pl = pendingPlacement;
                      setDatetimeModalVisible(false);
                      setPendingPlacement(null);
                      handleSaveWithPlacement(pl, {
                        date: eventDate,
                        startTime: eventStartTime,
                        endTime: eventEndTime,
                      });
                    }
                  }}
                  disabled={loading}
                  accessibilityLabel={t.calendar.create}
                >
                  {loading ? t.calendar.creating : t.calendar.create}
                </Button>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
