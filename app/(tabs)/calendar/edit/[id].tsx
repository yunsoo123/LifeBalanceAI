import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui';
import { TimeWheelPicker } from '@/components/ui/TimeWheelPicker';
import { LAYOUT } from '@/lib/layoutConstants';
import { useTheme } from '@/lib/ThemeContext';
import { getSurface, colors, borderRadius, spacing } from '@/lib/design-system';
import { supabase, tables } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';
import { useToastContext } from '@/lib/ToastContext';
import { getLocaleFromLang } from '@/lib/formatByLang';

type EventRow = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string | null;
  color?: string;
  recurrence?: string | null;
  achievement_percent?: number | null;
};

function dateToTimeString(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseTimeOnDate(date: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const out = new Date(date);
  out.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0);
  return out;
}

export default function CalendarEditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const locale = getLocaleFromLang(lang);
  const { showSuccess } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [recurrence, setRecurrence] = useState<string | null>(null);
  const [achievementPercent, setAchievementPercent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No event id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setError('Sign in required');
          return;
        }
        const { data, error: fetchError } = await tables
          .events()
          .select('id, title, start_time, end_time, description, recurrence, achievement_percent')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        if (cancelled) return;
        if (fetchError || !data) {
          setError('Event not found');
          return;
        }
        const row = data as EventRow;
        const start = new Date(row.start_time);
        const end = new Date(row.end_time);
        setTitle(row.title);
        setDescription(row.description ?? '');
        setStartTime(dateToTimeString(start));
        setEndTime(dateToTimeString(end));
        setEventDate(start);
        setRecurrence(row.recurrence ?? null);
        setAchievementPercent(row.achievement_percent ?? null);
      } catch {
        if (!cancelled) setError('Failed to load event');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert(t.calendar.eventTitle, t.calendar.eventTitleRequired);
      return;
    }
    if (!eventDate || !id) return;
    const timePattern = /^\d{1,2}:\d{2}$/;
    if (!timePattern.test(startTime.trim()) || !timePattern.test(endTime.trim())) {
      Alert.alert('Invalid time', 'Use HH:MM (e.g. 09:00)');
      return;
    }
    const dateOnly = new Date(eventDate);
    dateOnly.setHours(0, 0, 0, 0);
    const startDate = parseTimeOnDate(dateOnly, startTime.trim());
    const endDate = parseTimeOnDate(dateOnly, endTime.trim());
    if (endDate.getTime() <= startDate.getTime()) {
      Alert.alert(t.common.error, t.calendar.endTimeAfterStart);
      return;
    }
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t.calendar.signInRequiredTitle, t.calendar.signInRequiredMessage, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign in', onPress: () => router.replace('/sign-in') },
        ]);
        setSaving(false);
        return;
      }
      const { error: updateError } = await tables
        .events()
        .update({
          title: trimmedTitle,
          description: description.trim() || null,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          recurrence: recurrence || null,
          achievement_percent: achievementPercent ?? null,
        })
        .eq('id', id)
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      showSuccess(t.calendar.editEvent, 'Saved.');
      router.back();
    } catch (err) {
      console.error('Update event error:', err);
      Alert.alert(t.common.error, 'Failed to update event');
    } finally {
      setSaving(false);
    }
  }

  const screenBg = getSurface('screen', theme);
  const cardBg = getSurface('card', theme);
  const isDark = theme === 'dark';
  const borderColor = isDark ? colors.border.subtle : colors.border.subtleLight;
  const textPrimary = isDark ? colors.text.primary : colors.text.primaryLight;
  const textSecondary = isDark ? colors.text.secondary : colors.text.secondaryLight;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={{ marginTop: 16, fontSize: 16, color: textSecondary }}>
            {t.common.loading}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }} edges={['top', 'bottom']}>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, color: textPrimary }}>{error}</Text>
          <Button
            variant="outline"
            size="md"
            className="mt-6 min-h-[44px]"
            onPress={() => router.back()}
          >
            Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ marginBottom: 24, fontSize: 20, fontWeight: '700', color: textPrimary }}>
            {t.calendar.editEvent}
          </Text>
          <View className="mb-4">
            <Text className={`mb-2 ${LAYOUT.sectionTitle}`}>{t.calendar.eventTitle}</Text>
            <View
              style={{
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                minHeight: 48,
                justifyContent: 'center',
              }}
            >
              <TextInput
                style={{ flex: 1, paddingVertical: 12, fontSize: 16, color: textPrimary }}
                placeholder={t.calendar.eventTitlePlaceholder}
                placeholderTextColor={colors.text.tertiary}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>
          <View className="mb-4">
            <Text className={`mb-2 ${LAYOUT.sectionTitle}`}>{t.calendar.descriptionOptional}</Text>
            <View
              style={{
                minHeight: 48,
                justifyContent: 'center',
                borderRadius: borderRadius.md,
                borderWidth: 1,
                borderColor,
                paddingHorizontal: spacing.md,
                backgroundColor: cardBg,
              }}
            >
              <TextInput
                style={{ flex: 1, paddingVertical: 12, fontSize: 16, color: textPrimary }}
                placeholder={t.calendar.descriptionPlaceholder}
                placeholderTextColor={colors.text.tertiary}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>
          {eventDate && (
            <>
              <View className="mb-4">
                <Text className={`mb-2 ${LAYOUT.sectionTitle}`}>{t.calendar.date}</Text>
                <View
                  style={{
                    minHeight: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor,
                    paddingHorizontal: spacing.md,
                    backgroundColor: cardBg,
                  }}
                >
                  <Text style={{ fontSize: 16, color: textPrimary }}>
                    {eventDate.toLocaleDateString(locale, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
              <View className="mb-4">
                <Text className={`mb-2 ${LAYOUT.sectionTitle}`}>{t.calendar.startTime}</Text>
                <TimeWheelPicker
                  value={startTime}
                  onChange={setStartTime}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />
              </View>
              <View className="mb-6">
                <Text className={`mb-2 ${LAYOUT.sectionTitle}`}>{t.calendar.endTime}</Text>
                <TimeWheelPicker
                  value={endTime}
                  onChange={setEndTime}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />
              </View>
              <View className="mb-6">
                <Text className={`mb-2 ${LAYOUT.sectionTitle}`}>{t.calendar.recurrenceLabel}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { value: null, label: t.todo.recurrenceNone },
                    { value: 'daily', label: t.todo.recurrenceDaily },
                    { value: 'weekly', label: t.todo.recurrenceWeekly },
                    { value: 'monthly', label: t.todo.recurrenceMonthly },
                  ].map(({ value, label }) => (
                    <Pressable
                      key={value ?? 'none'}
                      onPress={() => setRecurrence(value)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor:
                          recurrence === value
                            ? colors.brand.primary
                            : isDark
                              ? colors.surface.input
                              : colors.border.subtleLight,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '500',
                          color: recurrence === value ? '#fff' : textSecondary,
                        }}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View className="mb-6">
                <Text className={`mb-2 ${LAYOUT.sectionTitle}`}>{t.calendar.achievementLabel}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { value: null as number | null, label: lang === 'ko' ? '미설정' : 'Not set' },
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%' },
                  ].map(({ value, label }) => (
                    <Pressable
                      key={value ?? 'null'}
                      onPress={() => setAchievementPercent(value)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor:
                          achievementPercent === value
                            ? colors.brand.primary
                            : isDark
                              ? colors.surface.input
                              : colors.border.subtleLight,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '500',
                          color: achievementPercent === value ? '#fff' : textSecondary,
                        }}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              size="md"
              className="min-h-[48px] flex-1"
              onPress={() => router.back()}
              accessibilityLabel="Cancel"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="min-h-[48px] flex-1"
              onPress={handleSave}
              disabled={saving}
              accessibilityLabel={saving ? 'Saving...' : 'Save'}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
