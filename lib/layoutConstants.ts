/**
 * Layout constants v2 — mendly-ui-overhaul-v2.design.md
 * LAYOUT uses v2 surface/card/input; DARK/LIGHT_BG = surface.screen.
 */
import { colors } from './design-system';

export const DARK_BG_COLOR = colors.surface.screen;
export const LIGHT_BG_COLOR = colors.surface.screenLight;

export const LAYOUT = {
  /** v2 surface.screen: #F8FAFC / #0F172A */
  screenBg: 'bg-slate-50 dark:bg-slate-900',
  /** 본문: 중앙 정렬, 최대 폭, 패딩 spacing.lg */
  contentContainer: 'w-full max-w-content mx-auto px-6 py-8',
  containerPadding: 'px-6 py-6',
  /** v2 header: surface.card + border.subtle, py-3 px-6 */
  header: 'px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700',
  /** 페이지 제목: typography.title 20px bold */
  pageTitle: 'text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50',
  /** 섹션 제목: typography.subhead 18px semibold */
  sectionTitle: 'text-lg font-semibold text-slate-800 dark:text-slate-100',
  bodyText: 'text-base leading-relaxed text-slate-600 dark:text-slate-400',
  /** 캡션: typography.caption 12px */
  caption: 'text-xs font-medium text-slate-500 dark:text-slate-500',
  /** v2 card: surface.card, border.subtle, radius.lg (16), p-4 */
  card: 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4',
  /** v2 input: h-12, surface.input, radius.md */
  input:
    'h-12 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-base',
  textarea:
    'w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 min-h-[96px] text-base leading-relaxed',
  gap: 'gap-4',
  gapLg: 'gap-6',
  cardGap: 'mb-5',
} as const;

export const CONTENT_MAX_WIDTH = 672;

/** v2 list row: min-h 48pt, padding horizontal lg, vertical 12 */
export const ROW_CLASS = 'min-h-[48px] px-6 py-3 border-b border-slate-200 dark:border-slate-700';
