import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, Platform, Share, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Spinner, ProgressBar, GoalVsActualBar, EmptyState } from '@/components/ui';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18n';
import {
  colors,
  getSurface,
  fontFamily,
  typography,
  spacing,
  borderRadius,
} from '@/lib/design-system';
import { CONTENT_MAX_WIDTH } from '@/lib/layoutConstants';
import { supabase, tables } from '@/lib/supabase/client';
import { getApiBase } from '@/lib/apiUrl';

interface WeeklyStats {
  week_start: string;
  week_end: string;
  planned_hours: number;
  actual_hours: number;
  completed_events: number;
  total_events: number;
  notes_created: number;
  achievement_rate: number;
}

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

function calculatePercentage(actual: number, planned: number): number {
  if (planned === 0) return 0;
  return Math.round((actual / planned) * 100);
}

function getAchievementColor(percentage: number): 'success' | 'warning' | 'error' {
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'warning';
  return 'error';
}

export default function ReviewScreen() {
  const router = useRouter();
  const { week: weekParam } = useLocalSearchParams<{ week?: string }>();
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const [currentWeek, setCurrentWeek] = useState<Date>(() => new Date());
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [generatingInsights, setGeneratingInsights] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);

  useEffect(() => {
    if (weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
      setCurrentWeek(new Date(weekParam + 'T00:00:00'));
    }
  }, [weekParam]);

  const loadWeeklyStats = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStats(null);
        return;
      }

      const { start, end } = getWeekBounds(currentWeek);
      const weekStartStr = start.toISOString().slice(0, 10);

      const { data: scheduleRows } = await tables
        .schedules()
        .select('total_hours')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .order('created_at', { ascending: false })
        .limit(1);

      const plannedHours = scheduleRows?.[0]?.total_hours ?? 0;

      const { data: events } = await tables
        .events()
        .select('id, title, start_time, end_time, completed_at')
        .eq('user_id', user.id)
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString());

      const totalEvents = events?.length ?? 0;
      const eventRows = events ?? [];
      const completedEvents =
        eventRows.filter((e) => e.completed_at != null).length ?? 0;

      const actualHours =
        eventRows.reduce((sum, event) => {
          const duration =
            (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) /
            (1000 * 60 * 60);
          return sum + duration;
        }, 0) ?? 0;

      const { count: notesCount } = await tables
        .notes()
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const achievementRate = calculatePercentage(actualHours, plannedHours || 1);

      setStats({
        week_start: start.toISOString(),
        week_end: end.toISOString(),
        planned_hours: Math.round(plannedHours * 10) / 10,
        actual_hours: Math.round(actualHours * 10) / 10,
        completed_events: completedEvents,
        total_events: totalEvents,
        notes_created: notesCount ?? 0,
        achievement_rate: plannedHours > 0 ? achievementRate : 0,
      });
    } catch (error) {
      console.error('Load stats error:', error);
      Alert.alert('Error', 'Failed to load weekly stats');
    } finally {
      setLoading(false);
    }
  }, [currentWeek]);

  useEffect(() => {
    loadWeeklyStats();
  }, [loadWeeklyStats]);

  function goToPreviousWeek() {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newDate);
  }

  function goToNextWeek() {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newDate);
  }

  function goToCurrentWeek() {
    setCurrentWeek(new Date());
  }

  const reviewCardStyle = {
    backgroundColor: getSurface('card', theme),
    borderWidth: 1,
    borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  };

  async function generateAIInsights() {
    if (!stats) {
      Alert.alert('No data', 'No statistics available for this week.');
      return;
    }

    setGeneratingInsights(true);
    setAiInsights([]);

    try {
      const base = getApiBase();
      const response = await fetch(`${base}/api/review/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            planned_hours: stats.planned_hours,
            actual_hours: stats.actual_hours,
            completed_events: stats.completed_events,
            total_events: stats.total_events,
            notes_created: stats.notes_created,
            achievement_rate: stats.achievement_rate,
            week_start: stats.week_start,
            week_end: stats.week_end,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { insights?: string[] };
      setAiInsights(data.insights ?? []);
    } catch (error) {
      console.error('AI insights error:', error);
      Alert.alert(
        'AI insights failed',
        'Failed to generate AI insights.\n\nCheck:\n1. OpenAI API key\n2. API server running\n3. /api/review/insights endpoint'
      );
    } finally {
      setGeneratingInsights(false);
    }
  }

  function generateTextSummary(): string {
    if (!stats) return '';

    const weekRange = formatDateRange(new Date(stats.week_start), new Date(stats.week_end));

    let summary = `MENDLY WEEKLY REVIEW\n`;
    summary += `${weekRange}\n`;
    summary += `${'='.repeat(50)}\n\n`;

    summary += `ACHIEVEMENT OVERVIEW\n`;
    summary += `${'-'.repeat(50)}\n`;
    summary += `Overall Achievement Rate: ${stats.achievement_rate}%\n`;
    summary += `Status: ${stats.achievement_rate >= 80 ? 'Excellent! 🎉' : stats.achievement_rate >= 60 ? 'Good 👍' : 'Keep Going 💪'}\n\n`;

    summary += `KEY METRICS\n`;
    summary += `${'-'.repeat(50)}\n`;
    summary += `Hours: ${stats.actual_hours}h / ${stats.planned_hours}h planned (${calculatePercentage(stats.actual_hours, stats.planned_hours || 1)}%)\n`;
    summary += `Events: ${stats.completed_events} / ${stats.total_events} completed (${calculatePercentage(stats.completed_events, stats.total_events || 1)}%)\n`;
    summary += `Notes Created: ${stats.notes_created}\n\n`;

    if (aiInsights.length > 0) {
      summary += `AI INSIGHTS\n`;
      summary += `${'-'.repeat(50)}\n`;
      aiInsights.forEach((insight, idx) => {
        summary += `${idx + 1}. ${insight}\n`;
      });
      summary += `\n`;
    }

    summary += `${'='.repeat(50)}\n`;
    summary += `Generated by Mendly on ${new Date().toLocaleString()}\n`;

    return summary;
  }

  async function exportAsText() {
    setExporting(true);
    try {
      const summary = generateTextSummary();

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mendly-review-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Exported', 'Review exported as text file!');
      } else {
        await Share.share({
          message: summary,
          title: 'Mendly Weekly Review',
        });
        Alert.alert('Export', 'Use the share sheet to save or send your review.');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export review');
    } finally {
      setExporting(false);
    }
  }

  async function shareReview() {
    if (!stats) return;
    setExporting(true);
    try {
      const summary = generateTextSummary();
      const shortSummary = `📊 My Week in Review\n\nAchievement: ${stats.achievement_rate}%\nHours: ${stats.actual_hours}/${stats.planned_hours}h\nEvents: ${stats.completed_events}/${stats.total_events}\n\nGenerated by Mendly`;

      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Mendly Weekly Review',
          text: shortSummary,
        });
        Alert.alert('Shared', 'Review shared!');
      } else if (Platform.OS !== 'web') {
        await Share.share({
          title: 'Mendly Weekly Review',
          message: shortSummary,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
        Alert.alert('Copied', 'Review copied to clipboard!');
      } else {
        Alert.alert('Share', 'Use Export or Copy to save your review.');
      }
    } catch (error) {
      const err = error as { name?: string };
      if (err.name === 'AbortError') {
        // User cancelled
      } else {
        console.error('Share error:', error);
        Alert.alert('Error', 'Failed to share review');
      }
    } finally {
      setExporting(false);
    }
  }

  async function copyToClipboard() {
    setExporting(true);
    try {
      const summary = generateTextSummary();

      if (
        Platform.OS === 'web' &&
        typeof navigator !== 'undefined' &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(summary);
        Alert.alert('Copied', 'Review copied to clipboard!');
      } else if (Platform.OS !== 'web') {
        await Share.share({
          message: summary,
          title: 'Mendly Weekly Review',
        });
        Alert.alert('Copied', 'Use the share sheet to copy or save your review.');
      } else {
        Alert.alert('Clipboard', 'Clipboard not available. Use Export or Share.');
      }
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: getSurface('screen', theme) }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
          backgroundColor: getSurface('card', theme),
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: typography.fontSize.titleLarge,
              fontFamily: fontFamily.bold,
              color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
            }}
          >
            {t.review.title}
          </Text>
          <Pressable
            onPress={() => setShowActionMenu(true)}
            style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
            accessibilityLabel={lang === 'ko' ? '메뉴' : 'Menu'}
            accessibilityRole="button"
          >
            <Text
              style={{
                fontSize: 20,
                color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
              }}
            >
              ⋮
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.md,
          }}
        >
          <Button variant="ghost" size="sm" onPress={goToPreviousWeek} accessibilityLabel={t.review.prev}>
            {t.review.prev}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={goToCurrentWeek}
            accessibilityLabel={t.review.thisWeek}
          >
            {stats
              ? formatDateRange(new Date(stats.week_start), new Date(stats.week_end))
              : t.review.thisWeek}
          </Button>
          <Button variant="ghost" size="sm" onPress={goToNextWeek} accessibilityLabel={t.review.next}>
            {t.review.next}
          </Button>
        </View>
      </View>

      <Modal
        visible={showActionMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionMenu(false)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => setShowActionMenu(false)}
        >
          <Pressable
            style={{
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: spacing.lg,
              paddingBottom: spacing.xl,
              backgroundColor: getSurface('card', theme),
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="md"
              onPress={() => {
                setShowActionMenu(false);
                shareReview();
              }}
              disabled={loading || exporting || !stats}
            >
              {t.review.share}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onPress={() => {
                setShowActionMenu(false);
                copyToClipboard();
              }}
              disabled={loading || exporting || !stats}
            >
              {t.review.copy}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onPress={() => {
                setShowActionMenu(false);
                exportAsText();
              }}
              disabled={loading || exporting || !stats}
            >
              {t.review.export}
            </Button>
            <Button
              variant="primary"
              size="md"
              onPress={() => {
                setShowActionMenu(false);
                generateAIInsights();
              }}
              disabled={loading || generatingInsights || exporting || !stats}
            >
              {generatingInsights ? t.common.loading : t.review.generate}
            </Button>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', width: '100%', paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        {loading ? (
          <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
            <Spinner />
            <Text
              style={{
                marginTop: spacing.md,
                fontSize: typography.fontSize.small,
                fontFamily: fontFamily.regular,
                color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
              }}
            >
              {t.common.loading}
            </Text>
          </View>
        ) : !stats ? (
          <View style={{ paddingVertical: spacing.xl }}>
            <EmptyState
              icon={<Text style={{ fontSize: 36 }}>📊</Text>}
              dark={theme === 'dark'}
              title={t.review.signInToSeeTitle}
              description={t.review.signInToSeeDesc}
              action={{
                label: lang === 'ko' ? '로그인' : 'Sign in',
                onPress: () => router.replace('/sign-in'),
              }}
            />
          </View>
        ) : (
          <>
            <View style={[reviewCardStyle, { marginTop: spacing.lg }]}>
              <Text
                style={{
                  fontSize: typography.fontSize.subhead,
                  fontFamily: fontFamily.medium,
                  color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                  marginBottom: spacing.md,
                }}
              >
                {t.review.summaryTitle}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      marginBottom: 2,
                      fontFamily: fontFamily.regular,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                    }}
                  >
                    {t.review.totalFocusTimeLabel}
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontFamily: fontFamily.bold,
                      color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                    }}
                  >
                    {stats.actual_hours}h
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: fontFamily.regular,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                    }}
                  >
                    / {stats.planned_hours}h {lang === 'ko' ? '계획' : 'planned'}
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          marginBottom: 2,
                          fontFamily: fontFamily.regular,
                          color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                        }}
                      >
                        {t.review.planAchievementRateLabel}
                      </Text>
                      <Pressable
                        onPress={() =>
                          Alert.alert(
                            t.review.planAchievementRateLabel,
                            t.review.planAchievementRateTooltip
                          )
                        }
                        style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
                        accessibilityLabel={t.review.planAchievementRateTooltip}
                        accessibilityRole="button"
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                          }}
                        >
                          (i)
                        </Text>
                      </Pressable>
                    </View>
                    <Text
                      style={{
                        fontSize: 24,
                        fontFamily: fontFamily.bold,
                        color:
                          getAchievementColor(stats.achievement_rate) === 'success'
                            ? colors.semantic.success
                            : getAchievementColor(stats.achievement_rate) === 'warning'
                              ? colors.semantic.warning
                              : colors.semantic.error,
                      }}
                    >
                      {stats.planned_hours > 0 ? `${stats.achievement_rate}%` : '—'}
                    </Text>
                  </View>
                </View>
              </View>
              {stats.planned_hours > 0 && (
                <ProgressBar
                  value={stats.achievement_rate}
                  variant={
                    getAchievementColor(stats.achievement_rate) === 'success'
                      ? 'success'
                      : getAchievementColor(stats.achievement_rate) === 'warning'
                        ? 'warning'
                        : 'error'
                  }
                  height={14}
                  showLabel
                  label={`${stats.achievement_rate}%`}
                />
              )}
            </View>

            <View style={reviewCardStyle}>
              <Text
                style={{
                  fontSize: typography.fontSize.subhead,
                  fontFamily: fontFamily.medium,
                  color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                  marginBottom: spacing.md,
                }}
              >
                {t.review.achievementOverview}
              </Text>
              <GoalVsActualBar
                activityName={lang === 'ko' ? '총 시간' : 'Total'}
                actualHours={stats.actual_hours}
                goalHours={stats.planned_hours}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}>
                <Text
                  style={{
                    fontSize: typography.fontSize.small,
                    fontFamily: fontFamily.regular,
                    color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                  }}
                >
                  {t.review.eventsCompleted}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{
                      fontSize: typography.fontSize.small,
                      fontFamily: fontFamily.medium,
                      color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                    }}
                  >
                    {stats.completed_events} / {stats.total_events}
                  </Text>
                  {stats.total_events > 0 && (
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: fontFamily.regular,
                        color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                      }}
                    >
                      ({t.review.eventCompletionRateLabel}{' '}
                      {Math.round((stats.completed_events / stats.total_events) * 100)}%)
                    </Text>
                  )}
                </View>
              </View>
              {stats.total_events > 0 && (
                <View style={{ marginTop: 8 }}>
                  <ProgressBar
                    value={(stats.completed_events / stats.total_events) * 100}
                    variant={
                      (stats.completed_events / stats.total_events) * 100 >= 80
                        ? 'success'
                        : (stats.completed_events / stats.total_events) * 100 >= 60
                          ? 'warning'
                          : 'error'
                    }
                    height={12}
                    showLabel
                    label={`${t.review.eventsCompleted} ${Math.round((stats.completed_events / stats.total_events) * 100)}%`}
                  />
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, marginTop: spacing.sm }}>
                <Text
                  style={{
                    fontSize: typography.fontSize.small,
                    fontFamily: fontFamily.regular,
                    color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                  }}
                >
                  {t.review.notesCreatedLabel}
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/notes')}
                  style={{ minHeight: 44, justifyContent: 'center' }}
                  accessibilityLabel={lang === 'ko' ? '노트로 이동' : 'Go to Notes'}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: typography.fontSize.small,
                      fontFamily: fontFamily.medium,
                      color: theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                    }}
                  >
                    {stats.notes_created} {t.review.newNotes}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={reviewCardStyle}>
              <Text
                style={{
                  fontSize: typography.fontSize.subhead,
                  fontFamily: fontFamily.medium,
                  color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                  marginBottom: spacing.md,
                }}
              >
                {t.review.aiInsights}
              </Text>
              {generatingInsights ? (
                <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: typography.fontSize.small,
                      fontFamily: fontFamily.regular,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                      marginBottom: 4,
                    }}
                  >
                    {t.review.analyzingYourWeek}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: fontFamily.regular,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                    }}
                  >
                    {t.review.mayTakeFewSeconds}
                  </Text>
                </View>
              ) : aiInsights.length === 0 ? (
                <Text
                  style={{
                    fontSize: typography.fontSize.small,
                    fontFamily: fontFamily.regular,
                    color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                    textAlign: 'center',
                    paddingVertical: spacing.lg,
                  }}
                >
                  {t.review.generateInsightsDesc}
                </Text>
              ) : (
                <View style={{ gap: 8 }}>
                  {aiInsights.map((insight, idx) => (
                    <View
                      key={idx}
                      style={{
                        padding: spacing.md,
                        borderRadius: borderRadius.lg,
                        borderWidth: 1,
                        borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                        backgroundColor: theme === 'dark' ? colors.surface.cardElevated : colors.surface.cardElevatedLight,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: typography.fontSize.small,
                          fontFamily: fontFamily.regular,
                          color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                        }}
                      >
                        {insight}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              <Button
                variant="secondary"
                size="md"
                onPress={generateAIInsights}
                disabled={loading || generatingInsights || exporting || !stats}
                style={{ marginTop: spacing.md }}
              >
                {generatingInsights ? t.common.loading : t.review.generate}
              </Button>
            </View>

            {exporting && (
              <View style={[reviewCardStyle, { alignItems: 'center' }]}>
                <Text
                  style={{
                    fontSize: typography.fontSize.small,
                    fontFamily: fontFamily.regular,
                    color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                  }}
                >
                  {t.review.preparingExport}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
