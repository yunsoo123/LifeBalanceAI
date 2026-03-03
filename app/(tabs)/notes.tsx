import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  Alert,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getStartOfWeek } from '@/lib/weekUtils';
import { Button, EmptyState, Badge } from '@/components/ui';
import { LAYOUT } from '@/lib/layoutConstants';
import { useTheme } from '@/lib/ThemeContext';
import {
  colors,
  getSurface,
  fontFamily,
  typography,
  spacing,
  borderRadius,
} from '@/lib/design-system';
import { supabase, tables } from '@/lib/supabase/client';
import { getApiBase } from '@/lib/apiUrl';
import { useI18n } from '@/lib/i18n';
import { useToastContext } from '@/lib/ToastContext';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  linked_event_ids: string[];
  created_at: string;
  updated_at: string;
}

interface LinkedEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
}

function formatDate(
  dateString: string,
  labels: { todayLabel: string; yesterdayLabel: string; daysAgoLabel: string }
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return labels.todayLabel;
  if (diffDays === 1) return labels.yesterdayLabel;
  if (diffDays < 7) return labels.daysAgoLabel.replace('{count}', String(diffDays));
  return date.toLocaleDateString();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/** Notion-style body: paragraphs, checklist (- [ ] / - [x]), code blocks (```) */
function NoteBodyView({
  content,
  theme,
  emptyNoteLabel,
}: {
  content: string;
  theme: 'light' | 'dark';
  emptyNoteLabel: string;
}) {
  if (!content.trim()) {
    return (
      <Text
        className="italic"
        style={{
          color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
          fontFamily: fontFamily.regular,
        }}
      >
        {emptyNoteLabel}
      </Text>
    );
  }
  const lines = content.split('\n');
  const nodes: { type: 'para' | 'check' | 'code'; text: string; done?: boolean }[] = [];
  let i = 0;
  let inCode = false;
  let codeBuf: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '```') {
      if (inCode) {
        nodes.push({ type: 'code', text: codeBuf.join('\n') });
        codeBuf = [];
      }
      inCode = !inCode;
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }
    const checkMatch = line.match(/^[-*]\s*\[\s*([xX]?)\s*\]\s*(.*)$/);
    if (checkMatch) {
      nodes.push({
        type: 'check',
        text: checkMatch[2].trim(),
        done: checkMatch[1].toLowerCase() === 'x',
      });
      i++;
      continue;
    }
    if (line.trim()) {
      nodes.push({ type: 'para', text: line });
    } else {
      nodes.push({ type: 'para', text: '\u00A0' });
    }
    i++;
  }
  if (inCode && codeBuf.length > 0) {
    nodes.push({ type: 'code', text: codeBuf.join('\n') });
  }

  const cardBg = theme === 'dark' ? colors.surface.cardElevated : colors.surface.cardLight;
  const borderColor = theme === 'dark' ? colors.border.subtle : colors.border.subtleLight;
  const textPrimary = theme === 'dark' ? colors.text.primary : colors.text.primaryLight;

  return (
    <View className="gap-3">
      {nodes.map((node, idx) => {
        if (node.type === 'para') {
          return (
            <Text
              key={idx}
              className={node.text === '\u00A0' ? 'h-2' : ''}
              style={{
                fontSize: 15,
                lineHeight: 24,
                color: textPrimary,
                fontFamily: fontFamily.regular,
              }}
            >
              {node.text === '\u00A0' ? '' : node.text}
            </Text>
          );
        }
        if (node.type === 'check') {
          return (
            <View
              key={idx}
              className="flex-row items-center gap-2 rounded-[20px] px-3 py-2 border"
              style={{
                backgroundColor: theme === 'dark' ? colors.surface.card : colors.gray[50],
                borderColor,
              }}
            >
              <Text className="text-lg">{node.done ? '☑' : '☐'}</Text>
              <Text
                className={`flex-1 text-[15px] ${node.done ? 'opacity-60' : ''}`}
                style={{
                  color: textPrimary,
                  fontFamily: fontFamily.regular,
                  ...(node.done && { textDecorationLine: 'line-through' }),
                }}
              >
                {node.text}
              </Text>
            </View>
          );
        }
        return (
          <View
            key={idx}
            className="rounded-[20px] p-4 border"
            style={{
              backgroundColor: cardBg,
              borderColor,
            }}
          >
            <Text
              className="text-[13px] font-mono"
              style={{
                color: textPrimary,
                fontFamily: fontFamily.regular,
              }}
              selectable
            >
              {node.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function rowToNote(row: {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  event_id: string | null;
  created_at: string;
  updated_at: string;
}): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags ?? [],
    linked_event_ids: row.event_id ? [row.event_id] : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export default function NotesScreen() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { width } = useWindowDimensions();
  const { showSuccess } = useToastContext();
  const dateLabels = {
    todayLabel: t.notes.todayLabel,
    yesterdayLabel: t.notes.yesterdayLabel,
    daysAgoLabel: t.notes.daysAgoLabel,
  };
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [editTags, setEditTags] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableEvents, setAvailableEvents] = useState<LinkedEvent[]>([]);
  const [showEventLinkModal, setShowEventLinkModal] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    summary?: string;
    actionItems?: string[];
    improvements?: string[];
  } | null>(null);
  const [generatingAI, setGeneratingAI] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'linked' | 'tag'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  const uniqueTags = useMemo(
    () => [...new Set(notes.flatMap((n) => n.tags))].filter(Boolean).sort().slice(0, 8),
    [notes]
  );

  const listAfterFilter = useMemo(() => {
    if (filterMode === 'all') return filteredNotes;
    if (filterMode === 'linked') return filteredNotes.filter((n) => n.linked_event_ids.length > 0);
    if (filterMode === 'tag' && selectedTag)
      return filteredNotes.filter((n) => n.tags.includes(selectedTag));
    return filteredNotes;
  }, [filteredNotes, filterMode, selectedTag]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    loadNotes();
    loadAvailableEvents();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function loadAvailableEvents() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mountedRef.current) return;
      if (!user) return;

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);

      const { data, error } = await tables
        .events()
        .select('id, title, start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', today.toISOString())
        .lte('start_time', futureDate.toISOString())
        .order('start_time');

      if (!mountedRef.current) return;
      if (error) throw error;

      setAvailableEvents(data ?? []);
    } catch (error) {
      console.error('Load events error:', error);
    }
  }

  async function loadNotes() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mountedRef.current) return;

      if (!user) {
        if (!mountedRef.current) return;
        setNotes([
          {
            id: 'mock-1',
            title: 'Welcome to Mendly Notes',
            content:
              'This is your Notion-style note editor. Create, edit, and organize your thoughts here.',
            tags: ['welcome', 'tutorial'],
            linked_event_ids: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        return;
      }

      const { data, error } = await tables
        .notes()
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (!mountedRef.current) return;
      if (error) throw error;

      setNotes((data ?? []).map(rowToNote));
    } catch (error) {
      console.error('Load notes error:', error);
      if (mountedRef.current) Alert.alert('Error', 'Failed to load notes');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  async function createNewNote() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert(t.notes.signInRequiredTitle, t.notes.signInRequiredMessage, [
          { text: t.common.cancel, style: 'cancel' },
          { text: t.notes.signIn, onPress: () => router.replace('/sign-in') },
        ]);
        return;
      }

      const { data, error } = await tables
        .notes()
        .insert({
          user_id: user.id,
          title: t.notes.untitledNote,
          content: '',
          tags: [],
          event_id: null,
        })
        .select()
        .single();

      if (error) throw error;

      const note = rowToNote(data);
      await loadNotes();
      setSelectedNote(note);
      setEditTitle(note.title);
      setEditContent(note.content);
      setEditTags(note.tags.join(', '));
      setIsEditing(true);
    } catch (error) {
      console.error('Create note error:', error);
      Alert.alert(t.common.error, t.notes.createNoteFailed);
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    if (!selectedNote) return;

    setLoading(true);
    try {
      const tagsArray = editTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const { error } = await tables
        .notes()
        .update({
          title: editTitle,
          content: editContent,
          tags: tagsArray,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedNote.id);

      if (error) throw error;

      await loadNotes();
      setIsEditing(false);
      showSuccess(lang === 'ko' ? '저장됨' : 'Saved', t.notes.noteSaved);
    } catch (error) {
      console.error('Save note error:', error);
      Alert.alert(t.common.error, t.notes.saveNoteFailed);
    } finally {
      setLoading(false);
    }
  }

  function deleteNote(noteId: string) {
    Alert.alert(t.notes.deleteNoteTitle, t.notes.deleteNoteMessage, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => performDeleteNote(noteId),
      },
    ]);
  }

  async function toggleEventLink(eventId: string) {
    if (!selectedNote) return;

    setLoading(true);
    try {
      const currentLinks = selectedNote.linked_event_ids ?? [];
      const newLinks = currentLinks.includes(eventId)
        ? currentLinks.filter((id) => id !== eventId)
        : [...currentLinks, eventId];

      const { error } = await tables
        .notes()
        .update({
          event_id: newLinks[0] ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedNote.id);

      if (error) throw error;

      setSelectedNote({ ...selectedNote, linked_event_ids: newLinks });
      await loadNotes();
    } catch (error) {
      console.error('Toggle event link error:', error);
      Alert.alert(t.common.error, t.notes.linkEventFailed);
    } finally {
      setLoading(false);
    }
  }

  function getLinkedEvents(): LinkedEvent[] {
    if (!selectedNote) return [];
    return availableEvents.filter((e) => selectedNote.linked_event_ids.includes(e.id));
  }

  async function generateAISuggestions() {
    if (!selectedNote || !selectedNote.content.trim()) {
      Alert.alert(t.notes.emptyNoteTitle, t.notes.emptyNoteMessage, [
        { text: t.common.ok, style: 'default' },
      ]);
      return;
    }

    setGeneratingAI(true);
    setAiSuggestions(null);

    try {
      const base = getApiBase();
      const response = await fetch(`${base}/api/note/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedNote.title,
          content: selectedNote.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { suggestions?: typeof aiSuggestions };
      setAiSuggestions(data.suggestions ?? null);
    } catch (error) {
      console.error('AI enhancement error:', error);
      Alert.alert(t.notes.aiSuggestionsFailedTitle, t.notes.aiSuggestionsFailedMessage);
    } finally {
      setGeneratingAI(false);
    }
  }

  async function performDeleteNote(noteId: string) {
    setLoading(true);
    try {
      const { error } = await tables.notes().delete().eq('id', noteId);

      if (error) throw error;

      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }

      await loadNotes();
      showSuccess(lang === 'ko' ? '삭제됨' : 'Deleted', t.notes.noteDeleted);
    } catch (error) {
      console.error('Delete note error:', error);
      Alert.alert(t.common.error, t.notes.deleteNoteFailed);
    } finally {
      setLoading(false);
    }
  }

  const showSidebar = width >= 640;
  const showEditor = width >= 640 || selectedNote;
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: getSurface('screen', theme) }}
      className={`flex-1 ${LAYOUT.screenBg}`}
      edges={['top', 'bottom']}
    >
      <View className="flex-1 flex-row">
        {(showSidebar || !selectedNote) && (
          <View
            className="w-full border-r flex-1"
            style={[
              showSidebar ? { maxWidth: 320 } : undefined,
              {
                backgroundColor: getSurface('screen', theme),
                borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
              },
            ]}
          >
            {/* 헤더: 캡션 + 제목 + primary "+ 새 노트" (design-system) */}
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.lg,
                paddingBottom: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor:
                  theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                backgroundColor: getSurface('card', theme),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: typography.fontSize.caption,
                      color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    {t.notes.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: typography.fontSize.titleLarge,
                      fontFamily: fontFamily.bold,
                      color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                      marginTop: 4,
                    }}
                  >
                    {t.notes.title}
                  </Text>
                </View>
                <Button
                  variant="primary"
                  size="md"
                  onPress={createNewNote}
                  disabled={loading}
                  accessibilityLabel={t.notes.newNote}
                >
                  + {t.notes.newNote}
                </Button>
              </View>
              <TextInput
                style={{
                  minHeight: 48,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 12,
                  borderRadius: borderRadius.md,
                  borderWidth: 1,
                  backgroundColor:
                    theme === 'dark' ? colors.surface.input : colors.surface.inputLight,
                  borderColor: theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                  color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                  fontSize: 15,
                }}
                placeholder={t.notes.searchPlaceholder}
                placeholderTextColor={colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: spacing.sm }}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              <Pressable
                onPress={() => {
                  setFilterMode('all');
                  setSelectedTag(null);
                }}
                style={{
                  minHeight: 44,
                  paddingHorizontal: 14,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor:
                    filterMode === 'all'
                      ? colors.brand.primary
                      : theme === 'dark'
                        ? colors.border.subtle
                        : colors.border.subtleLight,
                  backgroundColor:
                    filterMode === 'all'
                      ? theme === 'dark'
                        ? colors.brand.primaryMuted
                        : colors.brand.primaryMutedLight
                      : 'transparent',
                  justifyContent: 'center',
                }}
                accessibilityLabel={t.notes.filterAll}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: fontFamily.medium,
                    color:
                      filterMode === 'all'
                        ? colors.brand.primary
                        : theme === 'dark'
                          ? colors.text.secondary
                          : colors.text.secondaryLight,
                  }}
                >
                  {t.notes.filterAll}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setFilterMode('linked');
                  setSelectedTag(null);
                }}
                style={{
                  minHeight: 44,
                  paddingHorizontal: 14,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor:
                    filterMode === 'linked'
                      ? colors.brand.primary
                      : theme === 'dark'
                        ? colors.border.subtle
                        : colors.border.subtleLight,
                  backgroundColor:
                    filterMode === 'linked'
                      ? theme === 'dark'
                        ? colors.brand.primaryMuted
                        : colors.brand.primaryMutedLight
                      : 'transparent',
                  justifyContent: 'center',
                }}
                accessibilityLabel={t.notes.filterLinked}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: fontFamily.medium,
                    color:
                      filterMode === 'linked'
                        ? colors.brand.primary
                        : theme === 'dark'
                          ? colors.text.secondary
                          : colors.text.secondaryLight,
                  }}
                >
                  {t.notes.filterLinked}
                </Text>
              </Pressable>
              {uniqueTags.map((tag) => {
                const isSelected = filterMode === 'tag' && selectedTag === tag;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => {
                      setFilterMode('tag');
                      setSelectedTag(tag);
                    }}
                    style={{
                      minHeight: 44,
                      paddingHorizontal: 14,
                      borderRadius: 9999,
                      borderWidth: 1,
                      borderColor: isSelected
                        ? colors.brand.primary
                        : theme === 'dark'
                          ? colors.border.subtle
                          : colors.border.subtleLight,
                      backgroundColor: isSelected
                        ? theme === 'dark'
                          ? colors.brand.primaryMuted
                          : colors.brand.primaryMutedLight
                        : 'transparent',
                      justifyContent: 'center',
                    }}
                    accessibilityLabel={`Filter by tag ${tag}`}
                    accessibilityRole="button"
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: fontFamily.medium,
                        color: isSelected
                          ? colors.brand.primary
                          : theme === 'dark'
                            ? colors.text.secondary
                            : colors.text.secondaryLight,
                      }}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <FlatList
              className="flex-1"
              data={listAfterFilter}
              keyExtractor={(item) => item.id}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={async () => {
                    setRefreshing(true);
                    await loadNotes();
                    setRefreshing(false);
                  }}
                />
              }
              ListEmptyComponent={
                <View style={{ padding: spacing.lg }}>
                  <EmptyState
                    icon={<Text style={{ fontSize: 36 }}>📝</Text>}
                    dark={theme === 'dark'}
                    title={t.notes.emptyTitle}
                    description={searchQuery ? t.notes.emptyDescSearch : t.notes.emptyDesc}
                    action={
                      !searchQuery
                        ? { label: t.notes.firstNoteCta, onPress: createNewNote }
                        : undefined
                    }
                  />
                </View>
              }
              renderItem={({ item: note }) => (
                <Pressable
                  onPress={() => {
                    setSelectedNote(note);
                    setEditTitle(note.title);
                    setEditContent(note.content);
                    setEditTags(note.tags.join(', '));
                    setIsEditing(false);
                    setAiSuggestions(null);
                  }}
                  accessibilityLabel={`Note: ${note.title}`}
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={
                    selectedNote?.id === note.id
                      ? {
                          backgroundColor: 'rgba(139, 92, 246, 0.12)',
                          borderWidth: 2,
                          borderColor: colors.brand.primary,
                          borderRadius: borderRadius.xl,
                          padding: spacing.md,
                          marginBottom: spacing.sm,
                          minHeight: 48,
                        }
                      : {
                          backgroundColor: getSurface('card', theme),
                          borderWidth: 1,
                          borderColor:
                            theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                          borderRadius: borderRadius.xl,
                          padding: spacing.md,
                          marginBottom: spacing.sm,
                          minHeight: 48,
                        }
                  }
                >
                  <Text
                    className="font-semibold mb-1 text-[15px]"
                    style={{
                      color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                      fontFamily: fontFamily.medium,
                    }}
                    numberOfLines={1}
                  >
                    {note.title}
                  </Text>
                  <Text
                    className="text-sm mb-2"
                    style={{
                      color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                      fontFamily: fontFamily.regular,
                    }}
                    numberOfLines={2}
                  >
                    {truncateText(note.content, 80)}
                  </Text>
                  <View className="flex-row items-center gap-1 flex-wrap mt-1">
                    {note.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="default" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    {note.linked_event_ids.length > 0 && (
                      <Badge variant="info" size="sm">
                        📅 {note.linked_event_ids.length}
                      </Badge>
                    )}
                    <Text
                      className="text-xs ml-auto"
                      style={{
                        color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                        fontFamily: fontFamily.regular,
                      }}
                    >
                      {t.notes.lastEdited} {formatDate(note.updated_at, dateLabels)}
                    </Text>
                  </View>
                </Pressable>
              )}
              contentContainerStyle={
                listAfterFilter.length === 0
                  ? undefined
                  : { paddingBottom: 24, paddingHorizontal: 12 }
              }
            />
          </View>
        )}

        {/* Right: Notion-style note detail */}
        {(showEditor || !showSidebar) && (
          <View className="flex-1 min-w-0">
            {!selectedNote ? (
              <View
                className="flex-1 items-center justify-center p-6"
                style={theme === 'dark' ? { backgroundColor: '#1A1B27' } : undefined}
              >
                <EmptyState
                  icon={<Text className="text-4xl">✍️</Text>}
                  dark={theme === 'dark'}
                  title={t.notes.selectNoteTitle}
                  description={t.notes.selectNoteDesc}
                />
              </View>
            ) : (
              <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
                <View
                  style={{
                    height: 1,
                    backgroundColor:
                      theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                  }}
                />
                <View className={`${LAYOUT.containerPadding} pt-4`}>
                  {/* Action row */}
                  <View className="flex-row justify-between items-center mb-4">
                    <Text
                      className="text-[13px]"
                      style={{
                        color: theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                        fontFamily: fontFamily.regular,
                      }}
                    >
                      {t.notes.lastEdited} {formatDate(selectedNote.updated_at, dateLabels)}
                    </Text>
                    <View className="flex-row gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={() => {
                              setIsEditing(false);
                              setEditTitle(selectedNote.title);
                              setEditContent(selectedNote.content);
                              setEditTags(selectedNote.tags.join(', '));
                            }}
                            accessibilityLabel={t.common.cancel}
                          >
                            {t.common.cancel}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onPress={saveNote}
                            disabled={loading}
                            accessibilityLabel={loading ? t.notes.generating : t.common.save}
                          >
                            {loading ? t.common.saving : t.common.save}
                          </Button>
                        </>
                      ) : (
                        <>
                          {!showSidebar && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => setSelectedNote(null)}
                              accessibilityLabel={t.notes.back}
                            >
                              ← {t.notes.back}
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onPress={() => setIsEditing(true)}
                            accessibilityLabel={t.notes.edit}
                          >
                            {t.notes.edit}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onPress={() => deleteNote(selectedNote.id)}
                            disabled={loading}
                            accessibilityLabel={t.common.delete}
                          >
                            {t.common.delete}
                          </Button>
                        </>
                      )}
                    </View>
                  </View>

                  {isEditing ? (
                    <View>
                      <TextInput
                        className="mb-4 text-2xl font-bold"
                        style={{
                          color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                          fontFamily: fontFamily.bold,
                        }}
                        placeholder={t.notes.noteTitlePlaceholder}
                        placeholderTextColor="#9CA3AF"
                        value={editTitle}
                        onChangeText={setEditTitle}
                      />
                      <TextInput
                        className="rounded-xl border px-4 py-3 min-h-[320px] text-base"
                        style={{
                          backgroundColor:
                            theme === 'dark' ? colors.surface.input : colors.surface.inputLight,
                          borderColor:
                            theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                          color: theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                        }}
                        placeholder={t.notes.startWritingPlaceholder}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        value={editContent}
                        onChangeText={setEditContent}
                      />
                      <View className="mt-4">
                        <Text
                          className="mb-1 text-base font-semibold"
                          style={{
                            color:
                              theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                            fontFamily: fontFamily.medium,
                          }}
                        >
                          {t.notes.tagsLabel}
                        </Text>
                        <TextInput
                          className="rounded-xl border px-4 py-3 min-h-[48px] text-base"
                          style={{
                            backgroundColor:
                              theme === 'dark' ? colors.surface.input : colors.surface.inputLight,
                            borderColor:
                              theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                            color:
                              theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                          }}
                          placeholder={t.notes.tagsPlaceholder}
                          placeholderTextColor="#9CA3AF"
                          value={editTags}
                          onChangeText={setEditTags}
                        />
                      </View>
                      <View className="mt-4">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text
                            className="text-base font-semibold"
                            style={{
                              color:
                                theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                              fontFamily: fontFamily.medium,
                            }}
                          >
                            {t.notes.linkedEventsCount.replace(
                              '{count}',
                              String(selectedNote.linked_event_ids.length)
                            )}
                          </Text>
                          <Button
                            variant="secondary"
                            size="sm"
                            onPress={() => setShowEventLinkModal(true)}
                            accessibilityLabel={t.notes.linkEvent}
                          >
                            {t.notes.linkEvent}
                          </Button>
                        </View>
                        {showEventLinkModal && (
                          <View
                            className="rounded-[20px] border p-4 mt-2"
                            style={{
                              backgroundColor:
                                theme === 'dark'
                                  ? colors.surface.cardElevated
                                  : colors.surface.cardLight,
                              borderColor:
                                theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                            }}
                          >
                            <View className="flex-row justify-between items-center mb-2">
                              <Text
                                className="font-medium"
                                style={{
                                  color:
                                    theme === 'dark'
                                      ? colors.text.primary
                                      : colors.text.primaryLight,
                                  fontFamily: fontFamily.medium,
                                }}
                              >
                                {t.notes.selectEvents}
                              </Text>
                              <Pressable
                                onPress={() => setShowEventLinkModal(false)}
                                className="min-h-[48px] min-w-[48px] items-center justify-center"
                                accessibilityLabel={t.notes.done}
                              >
                                <Text
                                  className="text-[15px] font-semibold"
                                  style={{
                                    color: colors.brand.primary,
                                    fontFamily: fontFamily.medium,
                                  }}
                                >
                                  {t.notes.done}
                                </Text>
                              </Pressable>
                            </View>
                            <ScrollView className="max-h-[200px]">
                              {availableEvents.length === 0 ? (
                                <Text
                                  className="text-[13px]"
                                  style={{
                                    color:
                                      theme === 'dark'
                                        ? colors.text.tertiary
                                        : colors.text.secondaryLight,
                                    fontFamily: fontFamily.regular,
                                  }}
                                >
                                  {t.notes.noUpcomingEvents}
                                </Text>
                              ) : (
                                availableEvents.map((event) => {
                                  const isLinked = selectedNote.linked_event_ids.includes(event.id);
                                  return (
                                    <Pressable
                                      key={event.id}
                                      onPress={() => toggleEventLink(event.id)}
                                      hitSlop={8}
                                      accessibilityLabel={
                                        isLinked ? `Unlink ${event.title}` : `Link ${event.title}`
                                      }
                                      style={[
                                        isLinked
                                          ? {
                                              backgroundColor: 'rgba(139, 92, 246, 0.12)',
                                              borderWidth: 1,
                                              borderColor: colors.brand.primary,
                                            }
                                          : { backgroundColor: getSurface('input', theme) },
                                        {
                                          minHeight: 48,
                                          borderRadius: 12,
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          paddingVertical: 12,
                                          paddingHorizontal: 12,
                                          marginBottom: 4,
                                        },
                                      ]}
                                    >
                                      <View className="flex-row items-center gap-2">
                                        <Text className="text-lg">{isLinked ? '☑' : '☐'}</Text>
                                        <View className="flex-1">
                                          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {event.title}
                                          </Text>
                                          <Text className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(event.start_time).toLocaleString()}
                                          </Text>
                                        </View>
                                      </View>
                                    </Pressable>
                                  );
                                })
                              )}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View>
                      {/* 제목 블록 — Phase 2-2: rounded-[20px], design-system */}
                      <View
                        className="rounded-[20px] border px-4 py-3 mb-4"
                        style={{
                          backgroundColor:
                            theme === 'dark'
                              ? colors.surface.cardElevated
                              : colors.surface.cardLight,
                          borderColor:
                            theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                        }}
                      >
                        <Text
                          className="text-2xl font-bold mb-2"
                          style={{
                            color:
                              theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                            fontFamily: fontFamily.bold,
                          }}
                        >
                          {selectedNote.title}
                        </Text>
                        <View className="flex-row flex-wrap items-center gap-2">
                          {selectedNote.tags.map((tag, idx) => (
                            <Badge key={idx} variant="default" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          <Text
                            className="text-[13px]"
                            style={{
                              color:
                                theme === 'dark'
                                  ? colors.text.tertiary
                                  : colors.text.secondaryLight,
                              fontFamily: fontFamily.regular,
                            }}
                          >
                            {formatDate(selectedNote.updated_at, dateLabels)}
                          </Text>
                        </View>
                      </View>

                      {/* 일정 연결 — 항상 노출 (design: §1-1), 캡션 + 한 줄 설명 + CTA */}
                      <View
                        style={{
                          marginBottom: spacing.md,
                          padding: spacing.lg,
                          borderRadius: borderRadius.xl,
                          borderWidth: 1,
                          borderColor:
                            theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                          backgroundColor: getSurface('card', theme),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: typography.fontSize.small,
                            fontFamily: fontFamily.medium,
                            color:
                              theme === 'dark' ? colors.text.tertiary : colors.text.secondaryLight,
                            marginBottom: 4,
                          }}
                        >
                          {t.notes.linkEvent}
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: fontFamily.regular,
                            color:
                              theme === 'dark' ? colors.text.secondary : colors.text.secondaryLight,
                            marginBottom: spacing.md,
                          }}
                        >
                          {t.notes.linkEventDescription}
                        </Text>
                        {selectedNote.linked_event_ids.length > 0 ? (
                          <View style={{ gap: spacing.sm }}>
                            {getLinkedEvents().map((event) => (
                              <Pressable
                                key={event.id}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: spacing.md,
                                  borderRadius: borderRadius.md,
                                  borderWidth: 1,
                                  borderColor:
                                    theme === 'dark'
                                      ? colors.border.subtle
                                      : colors.border.subtleLight,
                                  backgroundColor: getSurface('input', theme),
                                  minHeight: 48,
                                }}
                                onPress={() =>
                                  Alert.alert(
                                    t.notes.eventAlertTitle,
                                    `${event.title}\n${t.notes.eventAlertMessage}`
                                  )
                                }
                                accessibilityLabel={`View event ${event.title}`}
                              >
                                <View>
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      fontFamily: fontFamily.medium,
                                      color:
                                        theme === 'dark'
                                          ? colors.text.primary
                                          : colors.text.primaryLight,
                                    }}
                                  >
                                    📅 {event.title}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color:
                                        theme === 'dark'
                                          ? colors.text.tertiary
                                          : colors.text.secondaryLight,
                                    }}
                                  >
                                    {new Date(event.start_time).toLocaleString()}
                                  </Text>
                                </View>
                                <Pressable
                                  onPress={() => toggleEventLink(event.id)}
                                  style={{
                                    minHeight: 44,
                                    minWidth: 44,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  accessibilityLabel={`Unlink ${event.title}`}
                                >
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color: colors.brand.primary,
                                      fontFamily: fontFamily.medium,
                                    }}
                                  >
                                    ✕
                                  </Text>
                                </Pressable>
                              </Pressable>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onPress={() => setShowEventLinkModal(true)}
                              accessibilityLabel={t.notes.selectEvents}
                            >
                              {t.notes.selectEvents}
                            </Button>
                          </View>
                        ) : (
                          <Button
                            variant="primary"
                            size="md"
                            onPress={() => setShowEventLinkModal(true)}
                            accessibilityLabel={t.notes.selectEvents}
                          >
                            {t.notes.selectEvents}
                          </Button>
                        )}
                      </View>

                      {/* 리뷰에서 보기 (N3) */}
                      <View style={{ marginBottom: spacing.md }}>
                        <Button
                          variant="outline"
                          size="md"
                          onPress={() => {
                            const linked = getLinkedEvents();
                            const dateForWeek =
                              linked.length > 0 ? linked[0].start_time : selectedNote.updated_at;
                            const weekStart = getStartOfWeek(new Date(dateForWeek));
                            router.push(`/(tabs)/review?week=${weekStart}`);
                          }}
                          accessibilityLabel={t.notes.viewInReview}
                        >
                          {t.notes.viewInReview}
                        </Button>
                      </View>

                      {/* 뷰 모드에서도 일정 선택 시 표시 (edit와 동일 블록) */}
                      {showEventLinkModal && (
                        <View
                          style={{
                            marginBottom: spacing.md,
                            padding: spacing.md,
                            borderRadius: borderRadius.xl,
                            borderWidth: 1,
                            borderColor:
                              theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                            backgroundColor: getSurface('cardElevated', theme),
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: spacing.sm,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: fontFamily.medium,
                                fontSize: 15,
                                color:
                                  theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                              }}
                            >
                              {t.notes.selectEvents}
                            </Text>
                            <Pressable
                              onPress={() => setShowEventLinkModal(false)}
                              style={{
                                minHeight: 48,
                                minWidth: 48,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              accessibilityLabel={t.notes.done}
                            >
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontFamily: fontFamily.medium,
                                  color: colors.brand.primary,
                                }}
                              >
                                {t.notes.done}
                              </Text>
                            </Pressable>
                          </View>
                          <ScrollView style={{ maxHeight: 200 }}>
                            {availableEvents.length === 0 ? (
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: fontFamily.regular,
                                  color:
                                    theme === 'dark'
                                      ? colors.text.tertiary
                                      : colors.text.secondaryLight,
                                }}
                              >
                                {t.notes.noUpcomingEvents}
                              </Text>
                            ) : (
                              availableEvents.map((event) => {
                                const isLinked = selectedNote.linked_event_ids.includes(event.id);
                                return (
                                  <Pressable
                                    key={event.id}
                                    onPress={() => toggleEventLink(event.id)}
                                    style={[
                                      {
                                        minHeight: 48,
                                        borderRadius: borderRadius.md,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 12,
                                        paddingHorizontal: 12,
                                        marginBottom: 4,
                                        backgroundColor: getSurface('input', theme),
                                      },
                                      isLinked && {
                                        backgroundColor: 'rgba(139, 92, 246, 0.12)',
                                        borderWidth: 1,
                                        borderColor: colors.brand.primary,
                                      },
                                    ]}
                                    accessibilityLabel={
                                      isLinked ? `Unlink ${event.title}` : `Link ${event.title}`
                                    }
                                  >
                                    <View
                                      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                                    >
                                      <Text style={{ fontSize: 18 }}>{isLinked ? '☑' : '☐'}</Text>
                                      <View style={{ flex: 1 }}>
                                        <Text
                                          style={{
                                            fontSize: 14,
                                            fontFamily: fontFamily.medium,
                                            color:
                                              theme === 'dark'
                                                ? colors.text.primary
                                                : colors.text.primaryLight,
                                          }}
                                        >
                                          {event.title}
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: 12,
                                            color:
                                              theme === 'dark'
                                                ? colors.text.tertiary
                                                : colors.text.secondaryLight,
                                          }}
                                        >
                                          {new Date(event.start_time).toLocaleString()}
                                        </Text>
                                      </View>
                                    </View>
                                  </Pressable>
                                );
                              })
                            )}
                          </ScrollView>
                        </View>
                      )}

                      {/* AI 요약 카드 — Phase 2-2: rounded-[20px], design-system */}
                      <View
                        className="rounded-[20px] border p-4 mb-4"
                        style={{
                          backgroundColor:
                            theme === 'dark'
                              ? colors.surface.cardElevated
                              : colors.surface.cardLight,
                          borderColor:
                            theme === 'dark' ? colors.border.subtle : colors.border.subtleLight,
                        }}
                      >
                        <View className="flex-row justify-between items-center mb-2">
                          <Text
                            className="text-base font-semibold"
                            style={{
                              color:
                                theme === 'dark' ? colors.text.primary : colors.text.primaryLight,
                              fontFamily: fontFamily.medium,
                            }}
                          >
                            {t.notes.aiSummaryLabel}
                          </Text>
                          <Button
                            variant="secondary"
                            size="md"
                            onPress={generateAISuggestions}
                            disabled={generatingAI || loading}
                            accessibilityLabel={generatingAI ? t.notes.generating : t.notes.enhance}
                          >
                            {generatingAI ? `🤖 ${t.notes.generating}` : `✨ ${t.notes.enhance}`}
                          </Button>
                        </View>
                        {aiSuggestions && (
                          <View className="bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/80 dark:border-violet-800/80 rounded-xl p-4">
                            {aiSuggestions.summary && (
                              <View className="mb-3">
                                <Text className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">
                                  {lang === 'ko' ? '📝 AI 요약' : `📝 ${t.notes.aiSummaryLabel}`}
                                </Text>
                                <Text className={`text-sm ${colors.text.primary}`}>
                                  {aiSuggestions.summary}
                                </Text>
                              </View>
                            )}
                            {aiSuggestions.actionItems && aiSuggestions.actionItems.length > 0 && (
                              <View className="mb-3">
                                <Text className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">
                                  {lang === 'ko' ? '✓ 실행 항목' : `✓ ${t.notes.actionItemsLabel}`}
                                </Text>
                                {aiSuggestions.actionItems.map((item, idx) => (
                                  <View key={idx} className="flex-row items-start gap-2 mb-1">
                                    <Text className="text-violet-600 dark:text-violet-400">•</Text>
                                    <Text className={`flex-1 text-sm ${colors.text.primary}`}>
                                      {item}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                            {aiSuggestions.improvements &&
                              aiSuggestions.improvements.length > 0 && (
                                <View>
                                  <Text className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">
                                    💡 {t.notes.suggestionsLabel}
                                  </Text>
                                  {aiSuggestions.improvements.map((item, idx) => (
                                    <View key={idx} className="flex-row items-start gap-2 mb-1">
                                      <Text className="text-violet-600 dark:text-violet-400">
                                        →
                                      </Text>
                                      <Text className={`flex-1 text-sm ${colors.text.primary}`}>
                                        {item}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                          </View>
                        )}
                        {!aiSuggestions && !generatingAI && (
                          <Text
                            className="text-[13px]"
                            style={{
                              color:
                                theme === 'dark'
                                  ? colors.text.tertiary
                                  : colors.text.secondaryLight,
                              fontFamily: fontFamily.regular,
                            }}
                          >
                            {t.notes.generateSuggestionsDesc}
                          </Text>
                        )}
                      </View>

                      {/* Body: paragraphs, checklist, code block */}
                      <NoteBodyView
                        content={selectedNote.content || ''}
                        theme={theme}
                        emptyNoteLabel={t.notes.emptyNoteParenthesis}
                      />
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
