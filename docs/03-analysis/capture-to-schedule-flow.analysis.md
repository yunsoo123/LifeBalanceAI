# Design: 캡처 → 일정·리뷰 연결감 (Phase C) - Analysis

**Date**: 2025-02-23  
**Design**: [capture-to-schedule-flow.design.md](../02-design/features/capture-to-schedule-flow.design.md)  
**Project**: Mendly

---

## Overview

"Inbox에 넣은 것이 Schedule/Calendar/Review로 이어진다"는 연결감을 위한 설계(Inbox 항목 뱃지, Review 주간 요약)와 현재 구현을 비교한 갭 분석이다. 1차 요구사항이 구현되어 있으며, 2차(Schedule 반영/Calendar 추가 뱃지)는 설계에서 1차 미구현 가능으로 되어 있어 제외.

---

## Gap Analysis

### 1. Inbox 항목 카드 뱃지

| 설계 | 구현 | 상태 |
|------|------|------|
| ✓ 구조화됨 (parsed 있음) | parsed 시 "구조화됨" 뱃지 (t.inbox.parsed), 기존 유지 | **Match** |
| 📋 Notes에 저장됨 | Entry.savedToNote 추가, 저장 성공 시 true. 뱃지 "Notes에 저장됨" (t.inbox.savedToNote) | **Match** |
| 저장 후 항목 유지, 뱃지만 표시 | 엔트리 제거하지 않고 savedToNote로 뱃지 표시 | **Match** |
| 저장 버튼 저장 후 숨김 | savedToNote일 때 onPress undefined, disabled | **Match** (버튼 비활성화로 효과 동일) |
| Schedule 반영됨 / Calendar에 추가됨 | 설계: 1차 미구현 가능 | **N/A** |

**데이터**: Entry에 `savedToNote?: boolean` (세션만, DB 없음) → 구현됨.  
**i18n**: `inbox.savedToNote` (한/영) → 구현됨.

### 2. Review와의 연결

| 설계 | 구현 | 상태 |
|------|------|------|
| Review 상단 또는 Achievement 카드 위 한 줄 요약 | Achievement 카드 위에 한 줄 텍스트 (review-weekly-summary) | **Match** |
| "이번 주 노트 N개 · 일정 M개" | t.review.weeklySummary.replace('{notes}', ...).replace('{events}', ...) | **Match** |
| loadWeeklyStats의 notes_created, total_events 사용 | loadWeeklyStats에서 notes_created, total_events 설정, stats로 전달 | **Match** |
| 데이터 있을 때만 표시 / 빈 주는 생략 또는 "이번 주 데이터 없음" | stats 존재 시에만 해당 블록 렌더, 빈 상태는 emptyDesc | **Match** |

**i18n**: `review.weeklySummary` (한/영) → 구현됨.

### 3. 적용 순서 (설계 §3)

1. i18n 추가 → 완료.  
2. Inbox: Entry savedToNote, 뱃지, 저장 후 버튼 숨김(비활성화) → 완료.  
3. Review: stats 있을 때 요약 한 줄 렌더링 → 완료.

---

## Match Rate Summary

| 영역 | Match | Missing | 비고 |
|------|-------|---------|------|
| Inbox 뱃지 (구조화됨, Notes에 저장됨) | 5 | 0 | - |
| Review 주간 요약 | 4 | 0 | - |
| i18n·데이터 모델 | 2 | 0 | - |

**Match rate**: **100%** (1차 범위 기준). 2차 뱃지는 설계상 미구현 가능.

---

## Recommended Actions

- 추가 수정 불필요. 성공 기준 충족: "노트로 저장" 후 "Notes에 저장됨" 뱃지 표시, Review에 "이번 주 노트 N개 · 일정 M개" 표시.

---

## Next Steps

1. **pdca report**: 완료 보고서 작성 권장 (`docs/04-report/features/capture-to-schedule-flow.report.md` 또는 동일 규칙).
2. (2차) Schedule 생성·Calendar 가져오기 시 항목 매핑 및 "Schedule 반영됨 / Calendar에 추가됨" 뱃지 구현 시 설계 문서와 동기화.
