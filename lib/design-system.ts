/**
 * Mendly Design System
 * Centralized design tokens for colors, typography, spacing, shadows, and animations
 */

// ============================================
// COLORS
// ============================================
export const colors = {
  // Brand Colors
  brand: {
    primary: '#6366F1', // Indigo-500 - Main brand color
    primaryDark: '#4F46E5', // Indigo-600 - Hover states
    primaryLight: '#818CF8', // Indigo-400 - Disabled states
    secondary: '#EC4899', // Pink-500 - Accent color
    secondaryDark: '#DB2777', // Pink-600
    secondaryLight: '#F472B6', // Pink-400
  },

  // Semantic Colors
  success: {
    DEFAULT: '#10B981', // Green-500
    light: '#34D399', // Green-400
    dark: '#059669', // Green-600
  },
  warning: {
    DEFAULT: '#F59E0B', // Amber-500
    light: '#FBBF24', // Amber-400
    dark: '#D97706', // Amber-600
  },
  error: {
    DEFAULT: '#EF4444', // Red-500
    light: '#F87171', // Red-400
    dark: '#DC2626', // Red-600
  },
  info: {
    DEFAULT: '#3B82F6', // Blue-500
    light: '#60A5FA', // Blue-400
    dark: '#2563EB', // Blue-600
  },

  // Neutral Colors (Light Mode)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Text Colors (utility)
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
    tertiary: 'text-gray-500 dark:text-gray-500',
    disabled: 'text-gray-400 dark:text-gray-600',
    inverse: 'text-white dark:text-gray-900',
  },

  // Background Colors (utility)
  background: {
    primary: 'bg-white dark:bg-gray-950',
    secondary: 'bg-gray-50 dark:bg-gray-900',
    tertiary: 'bg-gray-100 dark:bg-gray-800',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    active: 'active:bg-gray-200 dark:active:bg-gray-700',
  },

  // Border Colors (utility)
  border: {
    DEFAULT: 'border-gray-200 dark:border-gray-800',
    light: 'border-gray-100 dark:border-gray-900',
    medium: 'border-gray-300 dark:border-gray-700',
    strong: 'border-gray-400 dark:border-gray-600',
  },
} as const;

// ============================================
// TYPOGRAPHY
// ============================================
export const typography = {
  fontFamily: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    code: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  fontSize: {
    xs: 12, // Small labels, captions
    sm: 14, // Secondary text
    base: 16, // Body text (default)
    lg: 18, // Emphasized text
    xl: 20, // Small headings
    '2xl': 24, // Medium headings
    '3xl': 30, // Large headings
    '4xl': 36, // Hero text
    '5xl': 48, // Display text
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================
// SPACING
// ============================================
export const spacing = {
  xs: 4, // 4px
  sm: 8, // 8px
  md: 16, // 16px
  lg: 24, // 24px
  xl: 32, // 32px
  '2xl': 48, // 48px
  '3xl': 64, // 64px
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ============================================
// SHADOWS
// ============================================
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// ============================================
// ANIMATIONS
// ============================================
export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

// ============================================
// BREAKPOINTS (for responsive design)
// ============================================
export const breakpoints = {
  sm: 640, // Mobile landscape
  md: 768, // Tablet portrait
  lg: 1024, // Tablet landscape / small desktop
  xl: 1280, // Desktop
} as const;

// ============================================
// Z-INDEX LAYERS
// ============================================
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
