import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import { setOnboardingDone } from '@/lib/onboardingStorage';

const { width } = Dimensions.get('window');
const SLIDES = [
  {
    title: 'Dump your thoughts',
    body: 'Use Inbox to capture ideas and tasks with zero friction. Type or speak—we’ll structure it later.',
    emoji: '📥',
  },
  {
    title: 'AI builds your week',
    body: 'Tell Schedule your goals. Get a realistic weekly plan that respects your time and energy.',
    emoji: '✨',
  },
  {
    title: 'Calendar, notes, review',
    body: 'See your plan on the calendar, link notes to events, and get weekly insights to improve.',
    emoji: '📊',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    setPage(Math.round(x / width));
  }

  async function finish() {
    await setOnboardingDone();
    router.replace('/(tabs)/inbox');
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        onScroll={onScroll}
        scrollEventThrottle={32}
        showsHorizontalScrollIndicator={false}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={{ width }} className="flex-1 px-8 justify-center">
            <Text className="text-5xl text-center mb-6">{slide.emoji}</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-3">
              {slide.title}
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400 text-center">
              {slide.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="px-8 pb-8 flex-row items-center justify-between">
        <View className="flex-row gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === page ? 'w-6 bg-brand-primary' : 'w-2 bg-gray-300 dark:bg-gray-700'}`}
            />
          ))}
        </View>
        {page < SLIDES.length - 1 ? (
          <Button
            variant="primary"
            size="md"
            onPress={() => scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true })}
          >
            Next
          </Button>
        ) : (
          <Button variant="primary" size="md" onPress={finish}>
            Get started
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
