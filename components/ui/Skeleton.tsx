import React, { useEffect, useRef } from 'react';
import { View, Animated, type ViewProps, type ViewStyle } from 'react-native';

type SkeletonVariant = 'text' | 'circle' | 'rect';

interface SkeletonProps extends ViewProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number;
  animate?: boolean;
}

export function Skeleton({
  variant = 'rect',
  width = '100%',
  height = 20,
  animate = true,
  className = '',
  ...viewProps
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!animate) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animate, opacity]);

  const variantStyles: Record<SkeletonVariant, string> = {
    text: 'rounded',
    circle: 'rounded-full',
    rect: 'rounded-md',
  };

  const styleObj: ViewStyle = {
    width: width as ViewStyle['width'],
    height,
    opacity: animate ? opacity : 0.3,
  };

  return (
    <Animated.View
      {...viewProps}
      style={[styleObj]}
      className={`bg-gray-200 dark:bg-gray-800 ${variantStyles[variant]} ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
          height={16}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <View className="flex-row items-center mb-3">
        <Skeleton variant="circle" width={40} height={40} />
        <View className="ml-3 flex-1">
          <Skeleton variant="text" width="60%" height={16} className="mb-2" />
          <Skeleton variant="text" width="40%" height={12} />
        </View>
      </View>
      <SkeletonText lines={2} />
    </View>
  );
}
