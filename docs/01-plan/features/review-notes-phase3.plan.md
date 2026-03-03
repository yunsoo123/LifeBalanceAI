# 리뷰·노트 Phase 3 - Plan

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [Analysis](../../03-analysis/review-notes-current-and-improvements.md) §8 Phase 3

---

## Overview

Phase 3(기능 확장): 노트 목록 필터(N2), 노트↔리뷰 이동(N3/U6), 리뷰 목표–이벤트 매칭 완화(R3). 최소 단위로 N2 → N3 순 적용하고, R3는 별도 plan/design 후 진행한다.

---

## Scope

| # | 항목 | 설명 | 산출물 |
|---|------|------|--------|
| N2 | 목록 필터 | 목록 상단 "전체 / 태그별 / 일정 연결됨" 칩으로 필터 | notes.tsx 필터 UI·state |
| N3 / U6 | 노트↔리뷰 이동 | 노트 상세 "리뷰에서 보기" → 해당 주 리뷰; 리뷰 "이번 주 노트 N개" 탭 시 노트(필터) | 라우팅·연결 |
| R3 | 목표–이벤트 매칭 완화 | 활동명과 이벤트 제목이 다를 때 키워드/별칭 매핑 | 별도 plan·design 후 Do |

---

## Success Criteria

- **N2**: 노트 목록 상단에서 "전체" / "일정 연결됨" / 태그 칩 선택 시 목록이 해당 조건으로만 표시됨. 검색과 병행 가능.
- **N3**: 노트에서 "리뷰에서 보기" 시 해당 주 리뷰 탭으로 이동. 리뷰에서 "이번 주 노트 N개" 터치 시 노트 탭으로 이동(선택 시 해당 주 필터).
- **R3**: 별도 feature로 plan·design 후 구현.

---

## 적용 순서 (최소 단위)

1. **Plan** → 본 문서.
2. **Design** → N2 상세 스펙(필터 종류·state·UI). 이후 N3 design 추가.
3. **Do** → N2 구현 → tsc·lint → Analyze → Iterate → Report.
4. N3는 N2 완료 후 design → do 동일 사이클.
5. R3는 필요 시 `review-goal-event-matching.plan.md` 등 별도 작성.

---

## Preconditions

- Phase 1·2 완료. 노트 목록·검색(`filteredNotes`), `note.linked_event_ids` 존재.
- 리뷰 탭에 "이번 주 노트 N개" 또는 notes_created 표시 구간 있음.

---

## Next Steps

Design 문서 작성(N2 필터 칩)·Do(N2) 진행.
