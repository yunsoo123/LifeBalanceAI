/**
 * Scroll wheel time picker (HH:MM, 24h). Two columns: hour, minute (5-min steps).
 */
import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';

const ITEM_HEIGHT = 40;
const VISIBLE_HEIGHT = 120;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function parseValue(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(':').map(Number);
  const hour = Math.min(23, Math.max(0, isNaN(h) ? 9 : h));
  const minute = Math.min(55, Math.max(0, isNaN(m) ? 0 : Math.floor(m / 5) * 5));
  return { hour, minute };
}

function toValue(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export interface TimeWheelPickerProps {
  value: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'dark';
}

export function TimeWheelPicker({ value, onChange, theme = 'light' }: TimeWheelPickerProps) {
  const { hour, minute } = parseValue(value);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const isScrollingRef = useRef(false);

  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const centerClass =
    theme === 'dark' ? 'text-gray-100 font-semibold' : 'text-gray-900 font-semibold';

  const scrollToHour = useCallback((h: number) => {
    const y = h * ITEM_HEIGHT;
    hourScrollRef.current?.scrollTo({ y, animated: false });
  }, []);
  const scrollToMinute = useCallback((m: number) => {
    const idx = MINUTES.indexOf(m);
    const y = (idx >= 0 ? idx : 0) * ITEM_HEIGHT;
    minuteScrollRef.current?.scrollTo({ y, animated: false });
  }, []);

  useEffect(() => {
    scrollToHour(hour);
    scrollToMinute(minute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScrollBegin = () => {
    isScrollingRef.current = true;
  };
  const handleScrollEnd =
    (type: 'hour' | 'minute') => (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      if (type === 'hour') {
        const idx = Math.round(y / ITEM_HEIGHT);
        const h = Math.min(23, Math.max(0, idx));
        scrollToHour(h);
        const m = parseValue(value).minute;
        onChange(toValue(h, m));
      } else {
        const idx = Math.round(y / ITEM_HEIGHT);
        const i = Math.min(MINUTES.length - 1, Math.max(0, idx));
        const m = MINUTES[i];
        scrollToMinute(m);
        const h = parseValue(value).hour;
        onChange(toValue(h, m));
      }
      isScrollingRef.current = false;
    };

  return (
    <View className="flex-row items-center" style={{ height: VISIBLE_HEIGHT }}>
      <View style={{ width: 72, height: VISIBLE_HEIGHT }}>
        <ScrollView
          ref={hourScrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd('hour')}
          onScrollEndDrag={(e) => {
            if (!e.nativeEvent.contentOffset) return;
            handleScrollEnd('hour')(e);
          }}
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
          style={{ height: VISIBLE_HEIGHT }}
        >
          {HOURS.map((h) => (
            <View
              key={h}
              style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className={`text-base ${hour === h ? centerClass : textClass}`}>
                {String(h).padStart(2, '0')}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <Text className={`text-lg font-semibold ${textClass}`} style={{ marginHorizontal: 4 }}>
        :
      </Text>
      <View style={{ width: 72, height: VISIBLE_HEIGHT }}>
        <ScrollView
          ref={minuteScrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd('minute')}
          onScrollEndDrag={(e) => {
            if (!e.nativeEvent.contentOffset) return;
            handleScrollEnd('minute')(e);
          }}
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
          style={{ height: VISIBLE_HEIGHT }}
        >
          {MINUTES.map((m) => (
            <View
              key={m}
              style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className={`text-base ${minute === m ? centerClass : textClass}`}>
                {String(m).padStart(2, '0')}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
