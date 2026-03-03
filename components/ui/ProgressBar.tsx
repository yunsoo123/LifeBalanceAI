import React from 'react';
import { View, Text } from 'react-native';

export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'error';

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  variant?: ProgressBarVariant;
  height?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const variantBg: Record<ProgressBarVariant, string> = {
  default: 'bg-brand-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
};

export function ProgressBar({
  value,
  variant = 'default',
  height = 10,
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View className={className}>
      {(showLabel || label) && (
        <View className="flex-row justify-between items-center mb-1">
          {label ? (
            <Text className="text-[13px] text-gray-600 dark:text-gray-400">{label}</Text>
          ) : null}
          {showLabel ? (
            <Text className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
              {Math.round(pct)}%
            </Text>
          ) : null}
        </View>
      )}
      <View
        className="rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden"
        style={{ height }}
      >
        <View
          className={`h-full rounded-full ${variantBg[variant]}`}
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}

/** Goal vs actual: label, actual hours, goal hours, percentage (e.g. "앱개발 3h/5h 60%"). Supports >100% with overflow style. */
interface GoalVsActualBarProps {
  activityName: string;
  actualHours: number;
  goalHours: number;
  variant?: ProgressBarVariant;
  /** Bar fill color (hex). Overrides variant when set. */
  color?: string;
  className?: string;
}

export function GoalVsActualBar({
  activityName,
  actualHours,
  goalHours,
  variant: _variant = 'default',
  color: colorProp,
  className = '',
}: GoalVsActualBarProps) {
  const effectiveGoal = goalHours || 0.1;
  const percent =
    effectiveGoal > 0 ? Math.round((actualHours / effectiveGoal) * 100) : actualHours > 0 ? 100 : 0;
  const barPct = Math.min(100, percent);
  const overflowPct = percent > 100 ? Math.min(50, percent - 100) : 0;
  const labelText =
    goalHours === 0 ? `${actualHours}h (no plan)` : `${actualHours}h / ${goalHours}h (${percent}%)`;
  const displayVariant: ProgressBarVariant =
    percent >= 80 ? 'success' : percent >= 60 ? 'warning' : 'error';
  const fillColor = colorProp ?? undefined;
  const fillClass = !colorProp ? variantBg[displayVariant] : '';
  return (
    <View className={`mb-3 ${className}`}>
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center gap-2 flex-1">
          {colorProp ? (
            <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorProp }} />
          ) : null}
          <Text
            className="text-[14px] font-medium text-gray-800 dark:text-gray-100"
            numberOfLines={1}
          >
            {activityName}
          </Text>
        </View>
        <Text className="text-[13px] text-gray-500 dark:text-gray-400 shrink-0 ml-2">
          {labelText}
        </Text>
      </View>
      <View
        className="flex-row rounded-full bg-gray-200 dark:bg-zinc-700 overflow-visible"
        style={{ height: 8 }}
      >
        <View
          className={`h-full rounded-l-full ${fillClass}`}
          style={{
            width: `${barPct}%`,
            ...(fillColor ? { backgroundColor: fillColor } : {}),
          }}
        />
        {overflowPct > 0 && (
          <View
            className="h-full rounded-r-full opacity-90"
            style={{
              width: `${overflowPct}%`,
              backgroundColor: colorProp ?? '#8b5cf6',
            }}
          />
        )}
      </View>
    </View>
  );
}
