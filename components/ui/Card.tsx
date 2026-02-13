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
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    elevated: 'bg-white dark:bg-gray-900 shadow-md',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-700',
  };

  const paddingClasses: Record<CardPadding, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <View
      {...viewProps}
      className={`
        rounded-lg
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
  return <View className={`${className}`} {...props}>{children}</View>;
}

export function CardFooter({ children, className = '', ...props }: CardSectionProps) {
  return (
    <View className={`mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 ${className}`} {...props}>
      {children}
    </View>
  );
}
