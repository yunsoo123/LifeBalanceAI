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
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </Text>
      )}

      <View
        className={`
          flex-row items-center
          border rounded-md
          ${hasError ? 'border-error' : 'border-gray-300 dark:border-gray-700'}
          bg-white dark:bg-gray-900
          ${className}
        `}
      >
        {leftIcon && <View className="pl-3">{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          className={`
            flex-1
            px-4 py-3
            text-base
            text-gray-900 dark:text-gray-100
            min-h-[44px]
          `}
          placeholderTextColor="#9CA3AF"
          accessibilityLabel={label}
          accessibilityHint={hasError ? error : undefined}
        />

        {rightIcon && <View className="pr-3">{rightIcon}</View>}
      </View>

      {error && (
        <Text className="text-sm text-error mt-1">{error}</Text>
      )}

      {helperText && !error && (
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {helperText}
        </Text>
      )}
    </View>
  );
}
