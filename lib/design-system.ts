/**
 * Mendly Design System v2
 * Full rebuild tokens: mendly-ui-overhaul-v2.design.md
 * Colors: indigo–slate primary; theme-aware via Light suffix for light mode.
 */

// ============================================
// COLORS v2 (hex; use with theme: dark = default key, light = *Light)
// ============================================
export const colors = {
  brand: {
    primary: '#6366F1', // dark
    primaryLight: '#4F46E5', // light
    primaryMuted: '#312E81', // dark bg tint
    primaryMutedLight: '#EEF2FF', // light bg tint
    secondary: '#14B8A6', // dark (teal)
    secondaryLight: '#0D9488', // light
    secondaryMuted: '#134E4A', // dark
    secondaryMutedLight: '#CCFBF1', // light
    primaryDark: '#4F46E5',
  },
  /** v2 surfaces: screen = full-screen bg, card = cards/header, cardElevated = result card, input = input bar */
  surface: {
    screen: '#0F172A', // dark
    screenLight: '#F8FAFC', // light
    card: '#1E293B', // dark
    cardLight: '#FFFFFF', // light
    cardElevated: '#334155', // dark
    cardElevatedLight: '#FFFFFF', // light
    input: '#1E293B', // dark
    inputLight: '#F1F5F9', // light
    subtle: '#0F172A', // dark (hover area)
    subtleLight: '#F1F5F9', // light
    // legacy
    dark: '#0F172A',
    darkCard: '#1E293B',
    resultCard: '#334155',
    resultCardLight: '#FFFFFF',
  },
  /** v2 chat bubbles */
  chat: {
    userBubble: '#6366F1',
    userBubbleLight: '#4F46E5',
    aiBubble: '#334155',
    aiBubbleLight: '#E2E8F0',
    userBubbleText: '#FFFFFF',
    aiBubbleText: '#F8FAFC',
    aiBubbleTextLight: '#0F172A',
    resultCardBg: '#334155',
    resultCardBgLight: '#F1F5F9',
  },
  /** v2 text (hex for style prop) */
  text: {
    primary: '#F8FAFC',
    primaryLight: '#0F172A',
    secondary: '#94A3B8',
    secondaryLight: '#475569',
    tertiary: '#64748B',
    inverse: '#FFFFFF',
    inverseLight: '#0F172A',
    primaryClass: 'text-slate-50 dark:text-slate-900',
    secondaryClass: 'text-slate-400 dark:text-slate-600',
    tertiaryClass: 'text-slate-500 dark:text-slate-500',
    inverseClass: 'text-white dark:text-slate-900',
  },
  /** v2 semantic */
  semantic: {
    success: '#059669',
    successBg: '#064E3B',
    successBgLight: '#D1FAE5',
    warning: '#D97706',
    warningBg: '#78350F',
    warningBgLight: '#FEF3C7',
    error: '#DC2626',
    errorBg: '#7F1D1D',
    errorBgLight: '#FEE2E2',
    info: '#2563EB',
  },
  /** legacy semantic (keep for compatibility) */
  success: { DEFAULT: '#059669', light: '#34D399', dark: '#059669' },
  warning: { DEFAULT: '#D97706', light: '#FBBF24', dark: '#D97706' },
  error: { DEFAULT: '#DC2626', light: '#F87171', dark: '#DC2626' },
  info: { DEFAULT: '#2563EB', light: '#60A5FA', dark: '#2563EB' },

  primary: { DEFAULT: '#6366F1', dark: '#4F46E5' },

  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  background: {
    primary: 'bg-white dark:bg-slate-900',
    secondary: 'bg-slate-50 dark:bg-slate-950',
    tertiary: 'bg-slate-100 dark:bg-slate-800',
    hover: 'hover:bg-slate-100 dark:hover:bg-slate-800',
    active: 'active:bg-slate-200 dark:active:bg-slate-700',
  },

  border: {
    subtle: '#334155',
    subtleLight: '#E2E8F0',
    medium: '#475569',
    mediumLight: '#CBD5E1',
    strong: '#64748B',
    strongLight: '#94A3B8',
    DEFAULT: 'border-slate-200 dark:border-slate-700',
    light: 'border-slate-100 dark:border-slate-800',
    mediumClass: 'border-slate-300 dark:border-slate-600',
    strongClass: 'border-slate-400 dark:border-slate-500',
  },
} as const;

/** Theme-aware v2 surface color */
export function getSurface(
  key: 'screen' | 'card' | 'cardElevated' | 'input' | 'subtle',
  theme: 'light' | 'dark'
): string {
  const map: Record<string, string> = {
    screen: colors.surface.screen,
    screenLight: colors.surface.screenLight,
    card: colors.surface.card,
    cardLight: colors.surface.cardLight,
    cardElevated: colors.surface.cardElevated,
    cardElevatedLight: colors.surface.cardElevatedLight,
    input: colors.surface.input,
    inputLight: colors.surface.inputLight,
    subtle: colors.surface.subtle,
    subtleLight: colors.surface.subtleLight,
  };
  const k = key + (theme === 'light' ? 'Light' : '');
  return map[k] ?? colors.surface.card;
}

export function getBrand(
  key: 'primary' | 'primaryMuted' | 'secondary' | 'secondaryMuted',
  theme: 'light' | 'dark'
): string {
  if (key === 'primary') return theme === 'dark' ? colors.brand.primary : colors.brand.primaryLight;
  if (key === 'primaryMuted') return theme === 'dark' ? colors.brand.primaryMuted : colors.brand.primaryMutedLight;
  if (key === 'secondary') return theme === 'dark' ? colors.brand.secondary : colors.brand.secondaryLight;
  return theme === 'dark' ? colors.brand.secondaryMuted : colors.brand.secondaryMutedLight;
}

// ============================================
// TYPOGRAPHY v2 (numeric for RN fontSize/lineHeight)
// ============================================
/** Noto Sans KR — 한/영 동시 출시용 (app _layout에서 로드) */
export const fontFamily = {
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  bold: 'NotoSansKR_700Bold',
} as const;

export const typography = {
  fontFamily: {
    heading: fontFamily.bold,
    body: fontFamily.regular,
    code: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  fontSize: {
    caption: 12,
    small: 14,
    body: 16,
    bodyMedium: 16,
    subhead: 18,
    title: 20,
    titleLarge: 24,
    metric: 28,
    display: 32,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    caption: 16,
    small: 20,
    body: 24,
    bodyMedium: 24,
    subhead: 26,
    title: 28,
    titleLarge: 32,
    metric: 34,
    display: 40,
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// ============================================
// SPACING v2 (px)
// ============================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ============================================
// BORDER RADIUS v2 (px)
// ============================================
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const radiusClasses = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-[20px]',
  full: 'rounded-full',
} as const;

/** v2 card: surface.card + border.subtle + radius.lg + p-4 */
export const cardClasses =
  'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-card p-4';

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

export const animations = {
  duration: { fast: 150, normal: 250, slow: 350 },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;

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
