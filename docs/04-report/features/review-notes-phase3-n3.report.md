# 리뷰·노트 Phase 3 N3 (노트↔리뷰 이동) — Report

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Feature**: review-notes-phase3-n3  
**Related**: [Plan](../../01-plan/features/review-notes-phase3-n3.plan.md), [Design](../../02-design/features/review-notes-phase3-n3.design.md), [Analysis](../../03-analysis/review-notes-phase3-n3.analysis.md)

---

## Overview

Phase 3 N3(노트↔리뷰 이동)를 Do 완료 후 갭 분석·리포트로 마무리. 노트 상세 "리뷰에서 보기" → 해당 주 리뷰 탭, 리뷰 "Notes Created" 카드 터치 → 노트 탭 이동.

---

## 완료 요약

| 항목 | 내용 | 결과 |
|------|------|------|
| 노트 → 리뷰 | "리뷰에서 보기" 버튼, week=연결일정 또는 수정일 기준 | ✅ notes.tsx Button + getStartOfWeek + router |
| 리뷰 → 노트 | "Notes Created" 카드 터치 시 노트 탭 이동 | ✅ review.tsx Pressable + router.push |
| 리뷰 week 쿼리 | ?week=YYYY-MM-DD 수용 | ✅ 기존 구현 확인 |

---

## 구현 내용

- **notes.tsx**: getStartOfWeek import. 일정 연결 블록 아래 "리뷰에서 보기" Button. onPress에서 연결 일정 1건 start_time 또는 updated_at으로 week 계산 후 `router.push(\`/(tabs)/review?week=${weekStart}\`)`.
- **review.tsx**: "Notes Created" 카드를 Pressable로 감싸 `router.push('/(tabs)/notes')`. accessibilityLabel "Go to Notes".
- **리뷰 week**: useLocalSearchParams(week), useEffect로 유효 시 setCurrentWeek (기존).

---

## 품질 게이트

- tsc: 통과. Lint: 수정 파일 에러 없음.

---

## Next Steps

수동 확인: 노트에서 "리뷰에서 보기" → 리뷰 해당 주 표시, 리뷰에서 Notes Created 터치 → 노트 탭. 이후 R3(목표–이벤트 매칭) 별도 plan/design.
