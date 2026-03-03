import React from 'react';
import { View, Image, Text, type ImageProps } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends Omit<ImageProps, 'source'> {
  source?: ImageProps['source'];
  fallback?: string;
  size?: AvatarSize;
}

export function Avatar({ source, fallback, size = 'md', ...imageProps }: AvatarProps) {
  const sizeClasses: Record<AvatarSize, { container: string; text: string }> = {
    sm: { container: 'w-8 h-8', text: 'text-sm' },
    md: { container: 'w-12 h-12', text: 'text-lg' },
    lg: { container: 'w-16 h-16', text: 'text-2xl' },
    xl: { container: 'w-24 h-24', text: 'text-4xl' },
  };

  return (
    <View
      className={`
        ${sizeClasses[size].container}
        rounded-full
        overflow-hidden
        bg-brand-primary
        items-center
        justify-center
      `}
    >
      {source ? (
        <Image
          {...imageProps}
          source={source}
          className="w-full h-full"
          accessibilityRole="image"
        />
      ) : (
        <Text
          className={`
            ${sizeClasses[size].text}
            text-white
            font-semibold
            uppercase
          `}
        >
          {fallback ?? '?'}
        </Text>
      )}
    </View>
  );
}
