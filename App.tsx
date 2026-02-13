import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import {
  Skeleton,
  SkeletonCard,
  SkeletonText,
  Button,
  Toast,
  useToast,
} from '@/components/ui';

/**
 * UI 확인용 데모 화면
 * - Skeleton 애니메이션 (시뮬레이터에서 펄스 확인)
 * - Toast + useToast (버튼으로 각 variant 노출)
 */
export default function App() {
  const { toast, showSuccess, showError, showWarning, showInfo, dismissToast } = useToast();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <StatusBar style="auto" />

      <Toast
        visible={toast.visible}
        variant={toast.variant}
        message={toast.message}
        description={toast.description}
        onDismiss={dismissToast}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Core UI Part 2 확인
        </Text>

        {/* Skeleton */}
        <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Skeleton (애니메이션)
        </Text>
        <View className="mb-6">
          <Skeleton variant="rect" width="100%" height={120} className="mb-3" />
          <SkeletonText lines={3} />
          <View className="mt-4">
            <SkeletonCard />
          </View>
        </View>

        {/* Toast (useToast) */}
        <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Toast (useToast)
        </Text>
        <View className="gap-2 mb-4">
          <Button variant="primary" size="md" onPress={() => showSuccess('저장 완료', '일정이 생성되었습니다.')}>
            Success
          </Button>
          <Button variant="danger" size="md" onPress={() => showError('오류 발생', '다시 시도해 주세요.')}>
            Error
          </Button>
          <Button variant="secondary" size="md" onPress={() => showWarning('주의', '필수 항목을 확인하세요.')}>
            Warning
          </Button>
          <Button variant="ghost" size="md" onPress={() => showInfo('안내', 'useToast 훅이 정상 동작합니다.')}>
            Info
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
