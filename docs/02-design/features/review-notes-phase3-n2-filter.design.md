# 리뷰·노트 Phase 3 - Design (N2 필터)

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [Plan](../../01-plan/features/review-notes-phase3.plan.md)

---

## Overview

Phase 3 첫 슬라이스: **N2 노트 목록 필터**. 목록 상단에 "전체 / 일정 연결됨 / 태그별" 칩을 두고, 선택 시 목록을 필터링한다. 기존 검색(제목·내용·태그)과 병행 적용.

---

## N2 — 목록 필터 칩

### 요구사항
- 목록 상단 "전체" / "일정 연결됨" / 태그 칩으로 필터.
- 검색어와 필터를 동시 적용: `filteredBySearch` ∩ `filteredByChip`.

### 필터 종류
- **전체(all)**: 필터 없음. 모든 노트(검색만 적용).
- **일정 연결됨(linked)**: `note.linked_event_ids.length > 0` 인 노트만.
- **태그(tag)**: 특정 태그가 포함된 노트만. 칩은 "사용 중인 태그" 목록에서 생성(중복 제거, 정렬). 최대 8개 등 상한 선택 가능.

### State
- `filterMode: 'all' | 'linked' | 'tag'`.
- `selectedTag: string | null` (filterMode === 'tag' 일 때만 사용).
- 기존 `searchQuery`, `filteredNotes`(검색) 유지. 최종 목록 = `filteredNotes`에 필터 적용한 결과.

### UI
- **위치**: 검색바 바로 아래, 목록 위. 가로 스크롤 가능한 칩 행.
- **칩 구성**:
  1. "전체" (filterMode === 'all' 시 선택 상태).
  2. "일정 연결됨" (filterMode === 'linked' 시 선택).
  3. 노트에서 추출한 고유 태그 목록(각 태그 칩, filterMode === 'tag' && selectedTag === tag 시 선택).
- **선택 상태**: 선택된 칩은 primary 또는 filled 스타일, 미선택은 outline/secondary. 터치 타겟 44dp 이상(Badge/Pressable minHeight 44).
- **동작**: 칩 터치 시 해당 필터로 전환. "전체" 터치 시 filterMode='all'. "일정 연결됨" 터치 시 filterMode='linked'. 태그 칩 터치 시 filterMode='tag', selectedTag=해당 태그.

### 데이터
- `notes`에서 고유 태그: `useMemo(() => [...new Set(notes.flatMap(n => n.tags))].filter(Boolean).sort().slice(0, 8), [notes])`.
- 최종 목록: `useMemo`에서 `filteredNotes`(검색 결과)에 대해 filterMode·selectedTag 적용.

### i18n
- `notes.filterAll`: "전체" / "All".
- `notes.filterLinked`: "일정 연결됨" / "Linked to schedule".
- (태그는 사용자 입력값 그대로 표시.)

### 에러·경계
- 노트 0개: 칩만 표시, 목록은 빈 상태.
- 태그 0개: "전체", "일정 연결됨"만 표시.
- 검색 결과 0개: 필터와 무관하게 빈 상태 메시지.

---

## Implementation Order

1. i18n에 `filterAll`, `filterLinked` 추가.
2. state 추가: `filterMode`, `selectedTag`.
3. 고유 태그 목록 useMemo.
4. 최종 목록 useMemo(검색 결과 → 필터 적용).
5. 검색바 아래 칩 행 UI(Pressable 또는 Button size sm). "전체" / "일정 연결됨" / 태그 칩.
6. 터치 시 state 갱신. 목록은 이미 동일 useMemo에 의존하므로 자동 갱신.

---

## Next Steps

Do(N2) → tsc·lint → Analyze → Report. 이후 N3 design·do.
