import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState, Badge } from '@/components/ui';
import { supabase, tables } from '@/lib/supabase/client';

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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
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
  const { width } = useWindowDimensions();
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

  function filterNotes(): Note[] {
    if (!searchQuery.trim()) return notes;

    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    loadAvailableEvents();
  }, []);

  async function loadAvailableEvents() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

      if (!user) {
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

      if (error) throw error;

      setNotes((data ?? []).map(rowToNote));
    } catch (error) {
      console.error('Load notes error:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }

  async function createNewNote() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to create notes\n(Auth flow in Phase 5)');
        return;
      }

      const { data, error } = await tables
        .notes()
        .insert({
          user_id: user.id,
          title: 'Untitled Note',
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
      Alert.alert('Error', 'Failed to create note');
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
      Alert.alert('Saved', 'Note saved.');
    } catch (error) {
      console.error('Save note error:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setLoading(false);
    }
  }

  function deleteNote(noteId: string) {
    Alert.alert('Delete note', 'Delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
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
      Alert.alert('Error', 'Failed to link event');
    } finally {
      setLoading(false);
    }
  }

  function getLinkedEvents(): LinkedEvent[] {
    if (!selectedNote) return [];
    return availableEvents.filter((e) => selectedNote.linked_event_ids.includes(e.id));
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
      Alert.alert('Deleted', 'Note deleted.');
    } catch (error) {
      console.error('Delete note error:', error);
      Alert.alert('Error', 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  }

  const filteredNotes = filterNotes();
  const showSidebar = width >= 640;
  const showEditor = width >= 640 || selectedNote;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top', 'bottom']}>
      <View className="flex-1 flex-row">
        {/* Left Sidebar - Notes List */}
        {(showSidebar || !selectedNote) && (
          <View className="w-full sm:w-80 border-r border-gray-200 dark:border-gray-800 flex-1 sm:flex-none">
            <View className="px-6 pt-4 pb-2 border-b border-gray-200 dark:border-gray-800">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notes</Text>
                <Button variant="primary" size="sm" onPress={createNewNote} disabled={loading}>
                  + New
                </Button>
              </View>

              <TextInput
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                placeholder="Search notes..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView className="flex-1">
              {filteredNotes.length === 0 ? (
                <View className="p-6">
                  <EmptyState
                    icon={<Text className="text-4xl">📝</Text>}
                    title="No notes"
                    description={searchQuery ? 'No matching notes' : 'Create your first note'}
                  />
                </View>
              ) : (
                <View className="p-2">
                  {filteredNotes.map((note) => (
                    <Pressable
                      key={note.id}
                      onPress={() => {
                        setSelectedNote(note);
                        setEditTitle(note.title);
                        setEditContent(note.content);
                        setEditTags(note.tags.join(', '));
                        setIsEditing(false);
                      }}
                      className={`p-4 rounded-lg mb-1 ${
                        selectedNote?.id === note.id
                          ? 'bg-brand-primary/10 border border-brand-primary'
                          : 'bg-transparent'
                      }`}
                    >
                      <Text
                        className="font-semibold text-gray-900 dark:text-gray-100 mb-1"
                        numberOfLines={1}
                      >
                        {note.title}
                      </Text>
                      <Text
                        className="text-sm text-gray-600 dark:text-gray-400 mb-1"
                        numberOfLines={2}
                      >
                        {truncateText(note.content, 80)}
                      </Text>
                      <View className="flex-row items-center gap-1 flex-wrap">
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
                        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          {formatDate(note.updated_at)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Right Editor */}
        {(showEditor || !showSidebar) && (
          <View className="flex-1 min-w-0">
            {!selectedNote ? (
              <View className="flex-1 items-center justify-center p-6">
                <EmptyState
                  icon={<Text className="text-4xl">✍️</Text>}
                  title="Select a note"
                  description="Choose a note from the list or create a new one"
                />
              </View>
            ) : (
              <ScrollView className="flex-1">
                <View className="p-6">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      Last edited {formatDate(selectedNote.updated_at)}
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
                          >
                            Cancel
                          </Button>
                          <Button variant="primary" size="sm" onPress={saveNote} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </Button>
                        </>
                      ) : (
                        <>
                          {!showSidebar && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => {
                                setSelectedNote(null);
                              }}
                            >
                              ← Back
                            </Button>
                          )}
                          <Button variant="secondary" size="sm" onPress={() => setIsEditing(true)}>
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onPress={() => deleteNote(selectedNote.id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </View>
                  </View>

                  {isEditing ? (
                    <View>
                      <TextInput
                        className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-gray-900 dark:text-gray-100"
                        placeholder="Note title..."
                        placeholderTextColor="#9CA3AF"
                        value={editTitle}
                        onChangeText={setEditTitle}
                      />

                      <TextInput
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-base text-gray-900 dark:text-gray-100 min-h-[400px]"
                        placeholder="Start writing..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        value={editContent}
                        onChangeText={setEditContent}
                      />

                      <View className="mt-4">
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tags (comma-separated)
                        </Text>
                        <TextInput
                          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                          placeholder="work, personal, ideas..."
                          placeholderTextColor="#9CA3AF"
                          value={editTags}
                          onChangeText={setEditTags}
                        />
                      </View>

                      <View className="mt-4">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Linked Events ({selectedNote.linked_event_ids.length})
                          </Text>
                          <Button
                            variant="secondary"
                            size="sm"
                            onPress={() => setShowEventLinkModal(true)}
                          >
                            + Link Event
                          </Button>
                        </View>

                        {showEventLinkModal && (
                          <View className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mt-2">
                            <View className="flex-row justify-between items-center mb-2">
                              <Text className="font-medium text-gray-900 dark:text-gray-100">
                                Select Events
                              </Text>
                              <Pressable onPress={() => setShowEventLinkModal(false)}>
                                <Text className="text-brand-primary">Done</Text>
                              </Pressable>
                            </View>

                            <ScrollView className="max-h-[200px]">
                              {availableEvents.length === 0 ? (
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                  No upcoming events
                                </Text>
                              ) : (
                                availableEvents.map((event) => {
                                  const isLinked = selectedNote.linked_event_ids.includes(event.id);
                                  return (
                                    <Pressable
                                      key={event.id}
                                      onPress={() => toggleEventLink(event.id)}
                                      className={`p-2 rounded-lg mb-1 ${
                                        isLinked
                                          ? 'bg-brand-primary/10'
                                          : 'bg-white dark:bg-gray-800'
                                      }`}
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
                      <Text className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {selectedNote.title}
                      </Text>

                      <View className="flex-row flex-wrap gap-1 mb-4">
                        {selectedNote.tags.map((tag, idx) => (
                          <Badge key={idx} variant="default" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </View>

                      {selectedNote.linked_event_ids.length > 0 && (
                        <View className="mb-4">
                          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Linked Events
                          </Text>
                          <View className="flex-row flex-wrap gap-2">
                            {getLinkedEvents().map((event) => (
                              <Pressable
                                key={event.id}
                                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2"
                                onPress={() =>
                                  Alert.alert(
                                    'Navigate to event',
                                    `${event.title}\n(Full navigation in Phase 5)`
                                  )
                                }
                              >
                                <View className="flex-row items-center gap-2">
                                  <Text className="text-sm text-blue-700 dark:text-blue-300">
                                    📅 {event.title}
                                  </Text>
                                  <Pressable onPress={() => toggleEventLink(event.id)} hitSlop={8}>
                                    <Text className="text-xs text-blue-500">✕</Text>
                                  </Pressable>
                                </View>
                                <Text className="text-xs text-blue-600 dark:text-blue-400">
                                  {new Date(event.start_time).toLocaleString()}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        </View>
                      )}

                      <Text className="text-base text-gray-900 dark:text-gray-100 leading-relaxed">
                        {selectedNote.content || '(Empty note)'}
                      </Text>
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
