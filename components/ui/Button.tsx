import React from 'react';
import { Text, Pressable, ActivityIndicator, type PressableProps } from 'react-native';
import { colors } from '@/lib/design-system';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
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

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-brand-primary active:bg-brand-primary-dark',
    secondary: 'bg-brand-secondary active:bg-brand-secondary-dark',
    ghost: 'bg-transparent active:bg-gray-100 dark:active:bg-gray-800',
    danger: 'bg-error active:bg-error-dark',
  };

  const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
    sm: { container: 'px-3 py-2 min-h-[36px]', text: 'text-sm' },
    md: { container: 'px-4 py-3 min-h-[44px]', text: 'text-base' },
    lg: { container: 'px-6 py-4 min-h-[52px]', text: 'text-lg' },
  };

  const textColorClasses: Record<ButtonVariant, string> = {
    primary: 'text-white',
    secondary: 'text-white',
    ghost: 'text-brand-primary',
    danger: 'text-white',
  };

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      className={`
        rounded-lg
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
            font-semibold
          `}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
