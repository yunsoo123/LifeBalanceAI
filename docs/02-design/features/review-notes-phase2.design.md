# 리뷰·노트 Phase 2 - Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Related**: [Plan](../../01-plan/features/review-notes-phase2.plan.md)

---

## Overview

Phase 2 항목 R2·D4·D7에 대한 구현 스펙. 데이터·UI·i18n은 기존 구조 활용.

---

## R2 — 이벤트 완료율 % 표시

### 요구사항
- "완료한 일정 N / M" 옆에 "(이벤트 완료율 XX%)" 노출.
- `total_events > 0` 일 때만 표시.

### 데이터
- 기존: `stats.completed_events`, `stats.total_events`.
- 계산: `Math.round((completed_events / total_events) * 100)`.

### UI
- 위치: 목표 vs 실제 섹션 내 "완료한 일정" 행, "N / M" 텍스트 옆(같은 줄 또는 바로 다음).
- i18n: `t.review.eventCompletionRateLabel` ("이벤트 완료율" / "Event completion rate") 이미 존재.
- 표시 형식: `({eventCompletionRateLabel} XX%)`, 글자 크기·색은 보조 텍스트(text-xs, tertiary) 수준.

### 구현 상태
- **확인**: review.tsx 1074–1084 구간에 이미 동일 스펙으로 구현됨. R2는 Do 단계에서 코드 확인만 수행.

---

## D4 — 요약 숫자 강조

### 요구사항
- 총 몰입 시간(actual_hours)·계획 달성률(achievement_rate %)을 더 크고 눈에 띄게 표시.

### 현재
- 총 몰입: 라벨 12px, 값 `text-xl font-bold`.
- 달성률: 라벨 12px, 값 `text-xl font-bold` + semantic 색(success/warning/error).

### 변경 스펙
- **총 몰입 시간 숫자**: `text-xl` → `text-2xl` (24px), font-bold 유지, 색은 text.primary.
- **달성률 % 숫자**: `text-xl` → `text-2xl`, font-bold·semantic 색 유지.
- 라벨·보조 텍스트(전주 대비 등)는 기존 유지.

### 파일·위치
- `app/(tabs)/review.tsx`: 요약 카드 내
  - `stats.actual_hours` 표시 Text: className에 `text-2xl` 적용.
  - `stats.achievement_rate` 표시 Text: className에 `text-2xl` 적용.

---

## D7 — 목록 카드 정보 구조

### 요구사항
- 제목·요약·태그·연결 뱃지·수정일이 한 카드에서 스캔하기 쉽게 정리.

### 현재
- 카드: 제목(15px semibold, 1줄) → 요약(text-sm, 2줄) → 한 줄에 태그(2개)+연결 뱃지+수정일(text-xs, ml-auto).

### 변경 스펙
- **계층 유지**: 제목 → 요약 → 메타 행(태그·뱃지·수정일).
- **수정일 라벨**: 수정일 앞에 짧은 라벨 추가. i18n: `notes.updatedLabel` 없으면 `common.updated` 또는 "수정" / "Updated" (기존 키 활용 가능 시). 없으면 라벨 없이 기존처럼 날짜만 표시해도 무방 — "스캔하기 쉽게"는 여백·구분 강화로 충족 가능.
- **시각적 구분**: 메타 행 상단에 `marginTop: 4` 또는 `gap` 유지, 태그와 수정일 사이 시각적 구분(공백·점 등) 선택 사항.
- **최소 구현**: 메타 행을 명확히 한 줄로 유지하고, 수정일 앞에 라벨 추가(예: "수정 2026-02-22"). i18n 키 `notes.updatedLabel` 추가: ko "수정", en "Updated".

### 파일·위치
- `app/(tabs)/notes.tsx`: 노트 목록 FlatList renderItem 내 카드.
- `lib/i18n.tsx`: notes.updatedLabel 추가(없을 경우).

### 데이터
- 기존: `note.title`, `note.content`, `note.tags`, `note.linked_event_ids`, `note.updated_at`, `formatDate`, `dateLabels`.

---

## 에러·경계

- R2: `total_events === 0`이면 퍼센트 미표시(이미 구현).
- D4: `stats` 없을 때 요약 카드 미렌더링(기존 동일).
- D7: 태그/연결 없어도 카드 레이아웃 유지.

---

## Next Steps

Do: R2 확인 → D4 적용 → D7 적용 → tsc·lint → Analyze → Iterate(필요 시) → Report.
