import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Card, CardBody, EmptyState, Spinner, Badge } from '@/components/ui';
import { supabase, tables } from '@/lib/supabase/client';

type ScheduleActivity = { name: string; hoursPerWeek: number; optimalTime: string };
type LatestScheduleRow = {
  id: string;
  activities_json: ScheduleActivity[] | unknown;
  created_at: string;
  total_hours?: number;
  suggestions?: string[] | null;
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
}

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>(() => getWeekDays(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formStartTime, setFormStartTime] = useState<string>('09:00');
  const [formDuration, setFormDuration] = useState<number>(60);
  const [latestSchedule, setLatestSchedule] = useState<LatestScheduleRow | null>(null);

  function getEventsForDay(day: Date): CalendarEvent[] {
    return events
      .filter((e) => isSameDay(e.start, day))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

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

      const days = getWeekDays(selectedDate);
      const weekStart = days[0];
      const weekEnd = new Date(days[6]);
      weekEnd.setHours(23, 59, 59, 999);

      const { data, error } = await tables
        .events()
        .select('*')
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time');

      if (error) throw error;

      const mappedEvents: CalendarEvent[] = (data || []).map((e) => ({
        id: e.id,
        title: e.title,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        color: e.color ?? '#6366F1',
        description: e.description ?? undefined,
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Load events error:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedDay]);

  async function loadLatestSchedule() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await tables
        .schedules()
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return;
      if (data) setLatestSchedule(data as LatestScheduleRow);
    } catch (error) {
      console.error('Load schedule error:', error);
    }
  }

  useEffect(() => {
    setWeekDays(getWeekDays(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadLatestSchedule();
  }, []);

  async function createEvent(
    overrideTitle?: string,
    overrideStartTime?: string,
    overrideDuration?: number
  ) {
    const title = (overrideTitle ?? formTitle).trim();
    const startTime = overrideStartTime ?? formStartTime;
    const durationMin = overrideDuration ?? formDuration;

    if (!title) {
      Alert.alert('Required', 'Please enter event title');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to create events.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign in', onPress: () => router.replace('/sign-in') },
        ]);
        return;
      }

      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date(selectedDay);
      startDate.setHours(isNaN(hours) ? 9 : hours, isNaN(minutes) ? 0 : minutes, 0, 0);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + durationMin);

      const { error } = await tables.events().insert({
        user_id: user.id,
        title,
        description: formDescription.trim() || null,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        all_day: false,
        color: '#6366F1',
      });

      if (error) throw error;

      setFormTitle('');
      setFormDescription('');
      setFormStartTime('09:00');
      setFormDuration(60);
      setShowAddModal(false);
      await loadEvents();
      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      console.error('Create event error:', error);
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  function optimalTimeToColor(optimalTime: string): string {
    switch (optimalTime) {
      case 'morning':
        return '#10B981';
      case 'afternoon':
        return '#F59E0B';
      case 'evening':
        return '#6366F1';
      default:
        return '#6366F1';
    }
  }

  async function importScheduleToCalendar() {
    const activities = Array.isArray(latestSchedule?.activities_json)
      ? (latestSchedule!.activities_json as ScheduleActivity[])
      : [];
    if (!latestSchedule || activities.length === 0) {
      Alert.alert(
        'No schedule',
        'No AI schedule available to import. Generate one in the Schedule tab first.'
      );
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to import schedule.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign in', onPress: () => router.replace('/sign-in') },
        ]);
        return;
      }

      let offsetMinutes = 0;
      const gapMinutes = 60;
      let importedCount = 0;

      for (const activity of activities) {
        const durationMinutes = Math.max(30, Math.round((activity.hoursPerWeek / 7) * 60));

        const startDate = new Date(selectedDay);
        startDate.setHours(9, 0, 0, 0);
        startDate.setMinutes(startDate.getMinutes() + offsetMinutes);

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + durationMinutes);

        const { error } = await tables.events().insert({
          user_id: user.id,
          title: activity.name.trim(),
          description: 'From AI Schedule',
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          all_day: false,
          color: optimalTimeToColor(activity.optimalTime),
        });

        if (!error) importedCount++;
        offsetMinutes += durationMinutes + gapMinutes;
      }

      Alert.alert('Success', `Imported ${importedCount} activities to calendar!`);
      await loadEvents();
    } catch (error) {
      console.error('Import schedule error:', error);
      Alert.alert('Error', 'Failed to import schedule');
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(eventId: string) {
    if (eventId.startsWith('mock-')) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      return;
    }

    Alert.alert('Delete event?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const { error } = await tables.events().delete().eq('id', eventId);
            if (error) throw error;
            await loadEvents();
            Alert.alert('Done', 'Event deleted');
          } catch (error) {
            console.error('Delete event error:', error);
            Alert.alert('Error', 'Failed to delete event');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  function goToPreviousWeek() {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  }

  function goToNextWeek() {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  }

  function goToToday() {
    setSelectedDate(new Date());
    setSelectedDay(new Date());
  }

  const weekRange =
    weekDays.length >= 2
      ? `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`
      : formatDate(selectedDate);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar</Text>
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              size="sm"
              onPress={() => router.push('/(tabs)/notes')}
              accessibilityLabel="Open Notes tab"
            >
              📝 Notes
            </Button>
            {latestSchedule &&
              Array.isArray(latestSchedule.activities_json) &&
              (latestSchedule.activities_json as ScheduleActivity[]).length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={importScheduleToCalendar}
                  disabled={loading}
                  accessibilityLabel="Import AI schedule to calendar"
                >
                  📥 Import AI
                </Button>
              )}
            <Button
              variant="primary"
              size="sm"
              onPress={() => {
                setFormTitle('');
                setFormStartTime('09:00');
                setFormDuration(60);
                setShowAddModal(true);
              }}
              disabled={loading}
              accessibilityLabel="Add new event"
            >
              {loading ? 'Loading...' : '+ Add'}
            </Button>
          </View>
        </View>

        {latestSchedule &&
          Array.isArray(latestSchedule.activities_json) &&
          (latestSchedule.activities_json as ScheduleActivity[]).length > 0 && (
            <View className="mt-2">
              <Badge variant="info" size="sm">
                💡 {(latestSchedule.activities_json as ScheduleActivity[]).length} AI activities
                available
              </Badge>
            </View>
          )}

        {/* Week Navigation */}
        <View className="flex-row justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={goToPreviousWeek}
            accessibilityLabel="Previous week"
          >
            ← Prev
          </Button>
          <Pressable
            onPress={goToToday}
            hitSlop={12}
            accessibilityLabel={`Go to week ${weekRange}`}
          >
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {weekRange}
            </Text>
          </Pressable>
          <Button variant="ghost" size="sm" onPress={goToNextWeek} accessibilityLabel="Next week">
            Next →
          </Button>
        </View>
      </View>

      {/* Week Day Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-gray-200 dark:border-gray-800"
      >
        <View className="flex-row px-6 py-2 gap-2">
          {weekDays.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDay);
            const isToday = isSameDay(day, new Date());
            const dayEvents = getEventsForDay(day);

            return (
              <Pressable
                key={idx}
                onPress={() => setSelectedDay(day)}
                hitSlop={8}
                accessibilityLabel={`${formatDayName(day)} ${formatDate(day)}, ${dayEvents.length} events`}
                className={`items-center justify-center px-4 py-2 rounded-lg min-w-[60px] ${
                  isSelected ? 'bg-indigo-500' : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {formatDayName(day)}
                </Text>
                <Text
                  className={`text-lg font-bold ${
                    isSelected
                      ? 'text-white'
                      : isToday
                        ? 'text-indigo-500'
                        : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {day.getDate()}
                </Text>
                {dayEvents.length > 0 && (
                  <View className="flex-row gap-1 mt-1">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <View
                        key={i}
                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
                      />
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Events List */}
      <ScrollView className="flex-1">
        <View className="p-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {formatDate(selectedDay)} Events
          </Text>

          {loading ? (
            <View className="py-8 items-center">
              <Spinner size="md" text="Loading events..." />
            </View>
          ) : getEventsForDay(selectedDay).length === 0 ? (
            <EmptyState
              icon={<Text className="text-4xl">📅</Text>}
              title="No events"
              description="Add an event or create a schedule first"
              action={{
                label: 'Create schedule',
                onPress: () => router.push('/(tabs)/schedule'),
              }}
            />
          ) : (
            <View className="gap-2">
              {getEventsForDay(selectedDay).map((event) => (
                <Card key={event.id} variant="default" padding="md">
                  <CardBody>
                    <View className="flex-row items-start gap-2">
                      <View
                        className="w-1 min-h-[40px] rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 dark:text-gray-100">
                          {event.title}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </Text>
                        {event.description && (
                          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {event.description}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => Alert.alert('Edit', 'Full edit modal in Phase 5')}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onPress={() => deleteEvent(event.id)}
                          disabled={loading}
                        >
                          Delete
                        </Button>
                      </View>
                    </View>
                  </CardBody>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center p-6"
          onPress={() => setShowAddModal(false)}
        >
          <Pressable
            className="bg-white dark:bg-gray-900 rounded-xl p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              New Event
            </Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 mb-3"
              placeholder="Event title"
              placeholderTextColor="#9CA3AF"
              value={formTitle}
              onChangeText={setFormTitle}
            />
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 mb-3"
              placeholder="Description (optional)"
              placeholderTextColor="#9CA3AF"
              value={formDescription}
              onChangeText={setFormDescription}
            />
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 mb-4"
              placeholder="Start time (HH:MM)"
              placeholderTextColor="#9CA3AF"
              value={formStartTime}
              onChangeText={setFormStartTime}
            />
            <View className="flex-row gap-2">
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onPress={() => createEvent()}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
