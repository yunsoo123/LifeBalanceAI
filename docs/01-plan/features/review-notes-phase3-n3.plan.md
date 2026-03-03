# 리뷰·노트 Phase 3 N3 (노트↔리뷰 이동) - Plan

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [Phase 3 Plan](../../01-plan/features/review-notes-phase3.plan.md) § N3/U6

---

## Overview

노트 탭과 리뷰 탭 간 이동을 한 번에 할 수 있도록 한다. (1) 노트 상세에서 "리뷰에서 보기" → 해당 주 리뷰 탭으로 이동. (2) 리뷰에서 "이번 주 노트 N개" 터치 시 노트 탭으로 이동. 최소 단위로 탭 전환만 구현하고, "해당 주"는 노트→리뷰 시에만 주 단위 파라미터로 전달한다.

---

## Scope

| 방향 | 설명 | 산출물 |
|------|------|--------|
| 노트 → 리뷰 | 노트 상세에 "리뷰에서 보기" 버튼. 터치 시 리뷰 탭으로 이동하며, 연결된 일정 또는 노트 수정일 기준 주가 열리도록 함. | notes.tsx CTA, router.push + week 파라미터 / review.tsx week 쿼리 수용 |
| 리뷰 → 노트 | 리뷰 "이번 주 노트 N개" 행을 터치 가능하게 하여 노트 탭으로 이동. | review.tsx Pressable + router.push('/(tabs)/notes') |

---

## Success Criteria

- 노트 상세(뷰/편집)에서 "리뷰에서 보기" 터치 시 리뷰 탭으로 이동하고, 해당 노트와 연관된 주(연결 일정 주 또는 수정일 주)가 선택된 상태로 표시됨.
- 리뷰에서 "N개 newNotes" 행 터치 시 노트 탭으로 이동함.
- 터치 타겟 44dp 이상 유지.

---

## Preconditions

- N2 완료. (tabs)/review, (tabs)/notes 라우트 존재. review는 currentWeek 상태로 주별 데이터 로드. notes는 selectedNote, linked_event_ids, updated_at 보유.

---

## 적용 순서

1. Plan → 본 문서.
2. Design → N3 상세 스펙(버튼 위치·라벨·week 파라미터 형식·리뷰 쿼리 읽기).
3. Do → i18n 추가 → 리뷰 week 쿼리 처리 → 노트 "리뷰에서 보기" CTA → 리뷰 "노트 N개" Pressable → tsc·lint.

---

## Next Steps

Design 문서 작성 후 Do 진행.
