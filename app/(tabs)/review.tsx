import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, CardHeader, CardBody, Badge } from '@/components/ui';
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
  const [currentWeek, setCurrentWeek] = useState<Date>(() => new Date());
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [generatingInsights, setGeneratingInsights] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  const loadWeeklyStats = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const { start, end } = getWeekBounds(currentWeek);
        setStats({
          week_start: start.toISOString(),
          week_end: end.toISOString(),
          planned_hours: 40,
          actual_hours: 32,
          completed_events: 12,
          total_events: 15,
          notes_created: 8,
          achievement_rate: 80,
        });
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
        .select('start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString());

      const totalEvents = events?.length ?? 0;
      const eventRows = events ?? [];
      const completedEvents =
        eventRows.filter((e) => (e as { completed?: boolean }).completed).length ?? 0;

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
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top', 'bottom']}>
      <View className="px-6 pt-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">Weekly Review</Text>
          <View className="flex-row gap-2 flex-wrap justify-end">
            <Button
              variant="ghost"
              size="sm"
              onPress={copyToClipboard}
              disabled={loading || generatingInsights || exporting || !stats}
            >
              📋 Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={shareReview}
              disabled={loading || generatingInsights || exporting || !stats}
            >
              🔗 Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={exportAsText}
              disabled={loading || generatingInsights || exporting || !stats}
            >
              💾 Export
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onPress={generateAIInsights}
              disabled={loading || generatingInsights || exporting || !stats}
            >
              {generatingInsights ? '🤖 Generating...' : '✨ Generate'}
            </Button>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <Button variant="ghost" size="sm" onPress={goToPreviousWeek}>
            ← Prev
          </Button>
          <Button variant="ghost" size="sm" onPress={goToCurrentWeek}>
            {stats
              ? formatDateRange(new Date(stats.week_start), new Date(stats.week_end))
              : 'This Week'}
          </Button>
          <Button variant="ghost" size="sm" onPress={goToNextWeek}>
            Next →
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          {loading ? (
            <View className="items-center py-6">
              <Text className="text-gray-500 dark:text-gray-400">Loading statistics...</Text>
            </View>
          ) : !stats ? (
            <Text className="text-center text-gray-500 dark:text-gray-400">No data available</Text>
          ) : (
            <>
              <Card variant="default" padding="md" className="mb-6">
                <CardHeader>
                  <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Achievement Overview
                  </Text>
                </CardHeader>
                <CardBody>
                  <View className="items-center py-4">
                    <Text className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.achievement_rate}%
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Weekly Achievement Rate
                    </Text>
                    <Badge
                      variant={getAchievementColor(stats.achievement_rate)}
                      size="md"
                      className="mt-2"
                    >
                      {stats.achievement_rate >= 80
                        ? '🎉 Excellent!'
                        : stats.achievement_rate >= 60
                          ? '👍 Good'
                          : '💪 Keep Going'}
                    </Badge>
                  </View>
                </CardBody>
              </Card>

              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Key Metrics
                </Text>

                <Card variant="default" padding="md" className="mb-2">
                  <CardBody>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hours Completed
                      </Text>
                      <Badge
                        variant={getAchievementColor(
                          calculatePercentage(stats.actual_hours, stats.planned_hours || 1)
                        )}
                      >
                        {calculatePercentage(stats.actual_hours, stats.planned_hours || 1)}%
                      </Badge>
                    </View>
                    <View className="flex-row items-baseline gap-2">
                      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.actual_hours}h
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        / {stats.planned_hours}h planned
                      </Text>
                    </View>
                  </CardBody>
                </Card>

                <Card variant="default" padding="md" className="mb-2">
                  <CardBody>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Events Completed
                      </Text>
                      <Badge
                        variant={getAchievementColor(
                          calculatePercentage(stats.completed_events, stats.total_events || 1)
                        )}
                      >
                        {calculatePercentage(stats.completed_events, stats.total_events || 1)}%
                      </Badge>
                    </View>
                    <View className="flex-row items-baseline gap-2">
                      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.completed_events}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        / {stats.total_events} events
                      </Text>
                    </View>
                  </CardBody>
                </Card>

                <Card variant="default" padding="md">
                  <CardBody>
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes Created
                    </Text>
                    <View className="flex-row items-baseline gap-2">
                      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.notes_created}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">new notes</Text>
                    </View>
                  </CardBody>
                </Card>
              </View>

              <Card variant="default" padding="md">
                <CardHeader>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      AI Insights
                    </Text>
                    {aiInsights.length > 0 && (
                      <Badge variant="success" size="sm">
                        {aiInsights.length} insights
                      </Badge>
                    )}
                  </View>
                </CardHeader>
                <CardBody>
                  {generatingInsights ? (
                    <View className="py-4">
                      <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
                        🤖 Analyzing your week...
                      </Text>
                      <Text className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        This may take a few seconds
                      </Text>
                    </View>
                  ) : aiInsights.length === 0 ? (
                    <Text className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Generate AI insights to get personalized recommendations based on your weekly
                      performance
                    </Text>
                  ) : (
                    <View className="gap-2">
                      {aiInsights.map((insight, idx) => (
                        <View
                          key={idx}
                          className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4"
                        >
                          <View className="flex-row items-start gap-2">
                            <Text className="text-lg">
                              {idx === 0
                                ? '🎯'
                                : idx === 1
                                  ? '💡'
                                  : idx === 2
                                    ? '🌟'
                                    : idx === 3
                                      ? '📈'
                                      : idx === 4
                                        ? '🚀'
                                        : '✨'}
                            </Text>
                            <Text className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                              {insight}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </CardBody>
              </Card>

              {exporting && (
                <Card variant="default" padding="md" className="mt-4">
                  <CardBody>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      📤 Preparing export...
                    </Text>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
