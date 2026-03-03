import React from 'react';
import { View, TextInput, Text, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...textInputProps
}: InputProps) {
  const hasError = !!error;

  return (
    <View className="w-full">
      {label && (
        <Text className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          {label}
        </Text>
      )}

      <View
        className={`
          flex-row items-center rounded-2xl px-5 h-14
          border
          ${hasError ? 'border-red-500' : 'border-gray-200 dark:border-zinc-700'}
          bg-gray-50 dark:bg-zinc-800
          ${className}
        `}
      >
        {leftIcon && <View className="pr-2">{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          className={`
            flex-1 text-base
            text-gray-900 dark:text-gray-100
            min-h-0
          `}
          placeholderTextColor="#9CA3AF"
          accessibilityLabel={label}
          accessibilityHint={hasError ? error : undefined}
        />

        {rightIcon && <View className="pr-3">{rightIcon}</View>}
      </View>

      {error && <Text className="text-sm text-error mt-1">{error}</Text>}

      {helperText && !error && (
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{helperText}</Text>
      )}
    </View>
  );
}
