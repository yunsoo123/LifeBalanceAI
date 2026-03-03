import React from 'react';
import { Text, Pressable, ActivityIndicator, type PressableProps } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { colors } from '@/lib/design-system';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'active:opacity-90 text-white border-0',
    secondary:
      'bg-gray-100 dark:bg-zinc-800 active:bg-gray-200 dark:active:bg-zinc-700 text-gray-800 dark:text-gray-200 border-0',
    ghost: 'bg-transparent active:bg-gray-100 dark:active:bg-zinc-800 border-0',
    danger: 'bg-red-500 active:opacity-90 text-white border-0',
    outline:
      'bg-transparent border border-gray-200 dark:border-zinc-600 active:bg-gray-50 dark:active:bg-zinc-800 border-0',
  };

  const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
    sm: { container: 'px-4 py-2.5 min-h-[44px] rounded-xl', text: 'text-sm font-medium' },
    md: { container: 'px-5 py-3 min-h-[48px] rounded-xl', text: 'text-[15px] font-medium' },
    lg: { container: 'px-6 py-4 min-h-[52px] rounded-2xl', text: 'text-base font-medium' },
  };

  const textColorClasses: Record<ButtonVariant, string> = {
    primary: 'text-white',
    secondary: 'text-gray-800 dark:text-gray-200',
    ghost: '',
    danger: 'text-white',
    outline: '',
  };

  const ghostOutlineTextColor =
    variant === 'ghost' || variant === 'outline'
      ? isDark
        ? colors.text.primary
        : colors.text.primaryLight
      : undefined;
  const secondaryTextColor = variant === 'secondary' && isDark ? colors.text.primary : undefined;

  const primaryBg =
    variant === 'primary'
      ? { backgroundColor: isDisabled ? colors.gray[400] : colors.brand.primary }
      : undefined;

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      style={primaryBg}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size].container}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        flex-row items-center justify-center
      `}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? colors.brand.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text
          className={`
            ${sizeClasses[size].text}
            ${textColorClasses[variant]}
          `}
          style={
            ghostOutlineTextColor
              ? { color: ghostOutlineTextColor }
              : secondaryTextColor
                ? { color: secondaryTextColor }
                : undefined
          }
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
