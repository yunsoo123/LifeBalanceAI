# 리뷰·노트 Phase 3 N3 (노트↔리뷰 이동) - Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [Plan](../../01-plan/features/review-notes-phase3-n3.plan.md)

---

## Overview

노트 상세에서 리뷰 탭으로, 리뷰에서 노트 탭으로 한 번에 이동하는 UI와 라우팅 스펙. 주 단위 파라미터는 노트→리뷰 시에만 사용한다.

---

## 1. 노트 → 리뷰 ("리뷰에서 보기")

### 요구사항
- 노트 상세(뷰 모드 또는 편집 모드)에서 "리뷰에서 보기" CTA 터치 시 리뷰 탭으로 이동.
- 리뷰 탭에서 열릴 주: (1) 연결된 일정이 있으면 해당 일정의 start_time이 속한 주의 월요일. (2) 없으면 노트의 updated_at이 속한 주의 월요일.

### 주(week) 파라미터
- 형식: `week=YYYY-MM-DD` (해당 주 월요일, LOCAL 기준). `getStartOfWeek(date)` 사용 (lib/weekUtils).
- 리뷰 탭 URL 예: `/(tabs)/review?week=2026-02-17`.

### UI
- **위치**: 노트 상세 "일정 연결" 블록 아래. 한 줄로 "리뷰에서 보기" 버튼.
- **스타일**: outline 또는 ghost 버튼. minHeight 44.
- **노출**: selectedNote가 있을 때만 표시.

### 데이터
- 연결 일정 1건: getLinkedEvents() 첫 번째의 start_time. 없으면 selectedNote.updated_at.
- weekStart = getStartOfWeek(new Date(linkedEvent.start_time || selectedNote.updated_at)).

### i18n
- `notes.viewInReview`: "리뷰에서 보기" / "View in Review".

### 동작
- onPress: `router.push(\`/(tabs)/review?week=${weekStart}\`);`

---

## 2. 리뷰 → 노트 ("이번 주 노트 N개" 터치)

### 요구사항
- 리뷰 목표 vs 실제 섹션 내 "작성한 노트" / "notes created" 행 터치 시 노트 탭으로 이동.

### UI
- 기존 `{stats.notes_created} {t.review.newNotes}` 가 있는 View를 Pressable로 감싼다. minHeight 44.
- accessibilityLabel "Go to Notes" / "노트로 이동", accessibilityRole="button".

### 동작
- onPress: `router.push('/(tabs)/notes');`

---

## 3. 리뷰 탭에서 week 쿼리 수용

### 요구사항
- URL에 `?week=YYYY-MM-DD` 가 있으면 해당 주를 currentWeek로 설정.

### 구현
- `useLocalSearchParams()` (expo-router)로 `week` 읽기.
- `useEffect`: `week`가 있으면 `setCurrentWeek(new Date(week + 'T00:00:00'))`. 의존 배열 `[week]`.
- 잘못된 형식이면 무시.

---

## 4. 에러·경계

- 노트에 연결 일정 없으면 updated_at 기준으로 week 계산.
- week 파라미터 잘못된 형식이면 리뷰는 기존 currentWeek 유지.
