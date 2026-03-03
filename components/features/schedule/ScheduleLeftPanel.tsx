import React from 'react';
import { View, Text } from 'react-native';
import { LAYOUT } from '@/lib/layoutConstants';

const BULLETS: {
  icon: string;
  titleKo: string;
  bodyKo: string;
  titleEn: string;
  bodyEn: string;
}[] = [
  {
    icon: '💬',
    titleKo: '나 앱개발이랑 알바하고 싶은데…',
    bodyKo: '친구에게 말하듯 편하게 이야기하세요. 복잡한 시간 계산은 AI가 처리합니다.',
    titleEn: 'Just like talking to a friend',
    bodyEn: 'Speak freely; AI handles the time math.',
  },
  {
    icon: '🎤',
    titleKo: '자연어 & 음성 입력',
    bodyKo: 'Whisper API를 활용한 음성 인식으로, 타이핑 없이 생각나는 대로 말하면 자동 인식됩니다.',
    titleEn: 'Natural language & voice',
    bodyEn: 'Voice input with Whisper API.',
  },
  {
    icon: '❓',
    titleKo: '5-Step 스마트 질의응답',
    bodyKo: '모호한 일정은 AI가 역으로 질문하여(Few-shot prompting) 구체적인 계획으로 다듬습니다.',
    titleEn: '5-Step smart Q&A',
    bodyEn: 'AI refines vague plans with follow-up questions.',
  },
  {
    icon: '⚖️',
    titleKo: '현실성 체크 (Reality Check)',
    bodyKo: '"잠은 언제 자나요?" 총 활동 시간과 수면 시간을 분석해 번아웃을 방지합니다.',
    titleEn: 'Reality check',
    bodyEn: 'Sleep & activity analysis to prevent burnout.',
  },
];

interface ScheduleLeftPanelProps {
  lang: 'ko' | 'en';
  collapsed?: boolean;
  /** When true, no fixed min/max width (e.g. mobile stack) */
  compact?: boolean;
}

export function ScheduleLeftPanel({ lang, collapsed, compact }: ScheduleLeftPanelProps) {
  if (collapsed) return null;

  const isKo = lang === 'ko';
  return (
    <View
      className={`bg-white dark:bg-zinc-900 ${LAYOUT.containerPadding} ${compact ? 'pb-5 pt-4' : 'border-r border-gray-200 dark:border-zinc-800'}`}
      style={compact ? undefined : { minWidth: 260, maxWidth: 320 }}
    >
      <View className="border-b border-violet-500/50 pb-1.5 mb-4">
        <Text className="text-xs font-semibold tracking-widest text-violet-600 dark:text-violet-400">
          CORE FEATURE 01
        </Text>
      </View>
      <Text className={`${LAYOUT.sectionTitle} text-lg mb-1 text-gray-900 dark:text-gray-100`}>
        {isKo ? 'AI 대화형 일정 생성' : 'AI Conversational Schedule'}
      </Text>
      <Text className={`${LAYOUT.caption} mb-5`}>Brain Dump to Structured Plan</Text>
      <View className={LAYOUT.gap}>
        {BULLETS.map((b, idx) => (
          <View key={idx} className="flex-row gap-3">
            <Text className="text-xl">{b.icon}</Text>
            <View className="flex-1">
              <Text className={`${LAYOUT.sectionTitle} mb-1`}>{isKo ? b.titleKo : b.titleEn}</Text>
              <Text className={LAYOUT.bodyText}>{isKo ? b.bodyKo : b.bodyEn}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
