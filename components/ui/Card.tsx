import React from 'react';
import { View, type ViewProps } from 'react-native';

type CardVariant = 'default' | 'elevated' | 'outlined';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...viewProps
}: CardProps) {
  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800',
    elevated:
      'bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800',
    outlined: 'bg-transparent rounded-2xl border border-gray-200 dark:border-zinc-700',
  };

  const paddingClasses: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <View
      {...viewProps}
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </View>
  );
}

interface CardSectionProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '', ...props }: CardSectionProps) {
  return (
    <View className={`mb-3 ${className}`} {...props}>
      {children}
    </View>
  );
}

export function CardBody({ children, className = '', ...props }: CardSectionProps) {
  return (
    <View className={`${className}`} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, className = '', ...props }: CardSectionProps) {
  return (
    <View
      className={`mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
