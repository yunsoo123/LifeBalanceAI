/**
 * Free tier usage limits (한국 결제 대안 적용).
 * Stripe 미사용 시 무료 한도로 제한하고, Pro는 인앱 결제(IAP) 예정.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@mendly_usage_';

export const FREE_TIER_LIMITS = {
  schedulesPerMonth: 10,
  parsesPerMonth: 50,
  insightsPerMonth: 20,
} as const;

type UsageKey = 'schedules' | 'parses' | 'insights';

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function storageKey(kind: UsageKey): string {
  return `${PREFIX}${kind}_${getMonthKey()}`;
}

async function getStoredCount(kind: UsageKey): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(kind));
    if (raw == null) return 0;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

async function setStoredCount(kind: UsageKey, count: number): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(kind), String(count));
  } catch {
    // ignore
  }
}

export async function getUsage(kind: UsageKey): Promise<{ count: number; limit: number }> {
  const count = await getStoredCount(kind);
  const limit =
    kind === 'schedules'
      ? FREE_TIER_LIMITS.schedulesPerMonth
      : kind === 'parses'
        ? FREE_TIER_LIMITS.parsesPerMonth
        : FREE_TIER_LIMITS.insightsPerMonth;
  return { count, limit };
}

/**
 * @param kind - usage kind (schedules, parses, insights)
 * @param isPro - true면 한도 검사 생략, 항상 true 반환
 */
export async function checkLimit(kind: UsageKey, isPro?: boolean): Promise<boolean> {
  if (isPro === true) return true;
  const { count, limit } = await getUsage(kind);
  return count < limit;
}

export async function incrementUsage(kind: UsageKey): Promise<void> {
  const count = await getStoredCount(kind);
  await setStoredCount(kind, count + 1);
}
