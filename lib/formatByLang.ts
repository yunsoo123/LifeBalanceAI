/**
 * Locale-aware date/time formatting. Use with useI18n().lang.
 */
export type LocaleCode = 'ko-KR' | 'en-US';

export function getLocaleFromLang(lang: 'ko' | 'en'): LocaleCode {
  return lang === 'ko' ? 'ko-KR' : 'en-US';
}

export function formatDateByLang(
  date: Date,
  locale: LocaleCode,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
): string {
  return date.toLocaleDateString(locale, options);
}

export function formatTimeByLang(
  date: Date,
  locale: LocaleCode,
  options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: false }
): string {
  return date.toLocaleTimeString(locale, options);
}
