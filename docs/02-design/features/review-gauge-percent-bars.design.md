# 리뷰 게이지바·퍼센트 막대 — Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: [real-device-feedback-round3.plan.md](../../01-plan/features/real-device-feedback-round3.plan.md) § Phase B #6

---

## Overview

리뷰 탭에서 **달성률·지표**를 **가로 막대(게이지)** 로 퍼센트 표시를 더 명확히 한다.  
이미 `ProgressBar`, `GoalVsActualBar` 사용 중 → 라벨·구성만 보강.

---

## Current State

- 요약 카드: `ProgressBar` with `showLabel`, `label={planAchievementRateLabel + achievement_rate%}`, height 12.
- 목표 vs 실제: `GoalVsActualBar` per goal (activityName, actual/goal, % in label).

---

## UI Spec (보강)

1. **요약 카드 내 게이지 블록**
   - 게이지 바로 위에 **섹션 라벨** "달성률" / "Achievement rate" 추가 (캡션 스타일).
   - 기존 ProgressBar 유지, `height={14}` 로 약간 키워 가독성 확보.

2. **목표 vs 실제**
   - `GoalVsActualBar`는 이미 퍼센트 표시(actual/goal (n%)) → 변경 없음.
   - 카드 상단 라벨이 "목표 vs 실제"로 이미 명확 → 유지.

3. **이번 주 일정 완료율 (선택)**
   - 이번 주 일정 카드에 완료 수/전체 수 옆에 **작은 ProgressBar** (완료율 %) 추가 가능.  
   - 범위 내에서는 기존 "completed_events / total_events" 텍스트만 있어도 됨.

---

## Implementation Order

1. review.tsx 요약 카드: ProgressBar 위에 캡션 "달성률", bar height 14.
2. (선택) 이번 주 일정 카드에 완료율 가로 막대 추가.

---

**Next Steps**: Do 후 tsc·lint.
