import React from 'react';
import { View, Text, Platform } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { colors, fontFamily } from '@/lib/design-system';

/** 카톡형 말풍선: 둥글기·그림자·크기 조정 (꼬리 없음) */
export function ChatBubble({
  type,
  children,
  className = '',
}: {
  type: 'user' | 'ai';
  children: React.ReactNode;
  className?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isUser = type === 'user';
  const bubbleBg = isUser
    ? isDark
      ? colors.chat.userBubble
      : colors.chat.userBubbleLight
    : isDark
      ? colors.chat.aiBubble
      : colors.chat.aiBubbleLight;
  const textColor = isUser
    ? colors.chat.userBubbleText
    : isDark
      ? colors.chat.aiBubbleText
      : colors.chat.aiBubbleTextLight;
  return (
    <View className={`max-w-[80%] ${isUser ? 'self-end' : 'self-start'} ${className}`}>
      <View
        style={{
          backgroundColor: bubbleBg,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 14,
          minHeight: 44,
          justifyContent: 'center',
          ...(Platform.OS !== 'web' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 4,
          }),
        }}
      >
        <Text
          style={{
            color: textColor,
            fontSize: 16,
            lineHeight: 24,
            fontFamily: fontFamily.regular,
          }}
        >
          {children}
        </Text>
      </View>
    </View>
  );
}
