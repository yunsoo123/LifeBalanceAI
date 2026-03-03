import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  variant: ToastVariant;
  message: string;
  description?: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  variant,
  message,
  description,
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-20));
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      // Intentional: keep mounted for enter animation then optional timer
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
      }
      return undefined;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false);
    });
    return undefined;
    // opacity, translateY are stable (useState initializer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- opacity/translateY are stable refs
  }, [visible, duration, onDismiss]);

  useEffect(() => {
    // Intentional: sync mount so toast appears when visible becomes true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (visible) setShouldRender(true);
  }, [visible]);

  if (!shouldRender) return null;

  const variantStyles: Record<ToastVariant, { bg: string; icon: string }> = {
    success: { bg: 'bg-success', icon: '✓' },
    error: { bg: 'bg-error', icon: '✕' },
    warning: { bg: 'bg-warning', icon: '⚠' },
    info: { bg: 'bg-info', icon: 'ℹ' },
  };

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
      className="absolute top-12 left-4 right-4 z-50"
    >
      <Pressable onPress={onDismiss}>
        <View
          className={`${variantStyles[variant].bg} rounded-lg p-4 shadow-lg flex-row items-start`}
        >
          <View className="w-6 h-6 bg-white/20 rounded-full items-center justify-center mr-3">
            <Text className="text-white font-bold">{variantStyles[variant].icon}</Text>
          </View>

          <View className="flex-1">
            <Text className="text-white font-semibold text-base mb-1">{message}</Text>
            {description && <Text className="text-white/90 text-sm">{description}</Text>}
          </View>

          <Pressable onPress={onDismiss} className="ml-2">
            <Text className="text-white text-lg">×</Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface ToastState {
  visible: boolean;
  variant: ToastVariant;
  message: string;
  description?: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    variant: 'info',
    message: '',
  });

  const show = (variant: ToastVariant, message: string, description?: string) => {
    setToast({ visible: true, variant, message, description });
  };

  const dismiss = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast: show,
    dismissToast: dismiss,
    showSuccess: (message: string, description?: string) => show('success', message, description),
    showError: (message: string, description?: string) => show('error', message, description),
    showWarning: (message: string, description?: string) => show('warning', message, description),
    showInfo: (message: string, description?: string) => show('info', message, description),
  };
}
