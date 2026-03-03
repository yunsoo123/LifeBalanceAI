# ux-simplify-and-monetization - Analysis

**Date**: 2025-02-23  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Design**: [ux-simplify-and-monetization.design.md](../02-design/features/ux-simplify-and-monetization.design.md)

---

## Overview

Design 문서(시간 블록, Inbox CTA, 타임테이블 노출, 카드 스타일) 대비 구현 상태를 비교하고, 코드 리뷰(컨벤션·품질·보안)를 정리한 갭 분석 문서다.

---

## 1. Design vs 구현 비교

### 1.1 시간 블록

| 항목 | Design 스펙 | 구현 상태 | 비고 |
|------|-------------|-----------|------|
| 캘린더 이벤트 카드: 시간 위치 | 시간 블록을 제목 **위**에 배치 | ✅ 구현됨. `formatTime(start) – formatTime(end)` 제목 위 한 줄 | |
| 캘린더: 시간 스타일 | `text-[15px] font-semibold`, gray[700]/gray[300] | ✅ `text-[15px] font-semibold`, 다크 `#d1d5db`/라이트 `#374151` | 동일 계열 |
| 캘린더: 제목·설명 순서 | 시간 → 제목 → 설명 | ✅ 동일 순서, `text-base font-semibold` 제목, `text-[13px]` 설명 | |
| 캘린더: 색 바 높이 | 최소 40px | ✅ `min-h-[44px]` | 터치 가이드 충족 |
| 스케줄 활동: 시간 블록 | "요일 · HH:MM" 한 줄, `text-[14px] font-semibold` | ✅ `timeBlockText` = `DAY_LABELS[slot.dayOfWeek] · formatTimeSlot(slot.startMinutes)` | |
| 스케줄: overrides 반영 | overrides 있으면 해당 요일·시작시간 | ✅ `getEffectiveSlot(schedule, overrides, index)` 사용 | |

**매칭**: 시간 블록 관련 Design 항목 전부 구현됨.

---

### 1.2 Inbox CTA

| 항목 | Design 스펙 | 구현 상태 | 비고 |
|------|-------------|-----------|------|
| 파싱 결과 블록 버튼 라벨 | "캘린더에 N개 추가" (단일 CTA) | ✅ `캘린더에 ${parsedScheduleEvents.length}개 추가` / 영문 동일 | |
| 하단 중복 제거 | "구조화하기"/"자동 일정" 둘 중 하나로 통합 | ✅ "자동 일정" 제거, "구조화하기" 1개만 유지 (outline 스타일) | |
| 옵션 A (파싱+배치 한 번에) | 선택 사항 | ❌ 미구현. 파싱 후 "캘린더에 N개 추가" 탭으로 별도 실행 | 범위 외로 두어도 무방 |

**매칭**: 필수 CTA 단일화·라벨 통일 완료. 옵션 A는 미구현(추가 개선 시 검토).

---

### 1.3 타임테이블 노출

| 항목 | Design 스펙 | 구현 상태 | 비고 |
|------|-------------|-----------|------|
| viewMode 초기값 | `'timetable'` | ✅ `useState<'month' \| 'timetable'>('timetable')` | |
| 토글 라벨 | "월간" / "이번 주" | ✅ "월간", "이번 주" 로 표기 | |

**매칭**: 타임테이블 노출 관련 Design 전부 반영됨.

---

### 1.4 카드 스타일

| 항목 | Design 스펙 | 구현 상태 | 비고 |
|------|-------------|-----------|------|
| 캘린더 이벤트 카드 | rounded-2xl, p-4, border, 시간/제목/설명 블록 | ✅ 적용됨. 구조·간격 일치 | |
| 스케줄 활동 리스트 | 아이콘 \| 이름 \| 시간 블록 \| 시간 변경 버튼 | ✅ 이름 → 시간 블록 → h/week·optimalTime, 버튼 우측 | |
| Inbox 입력 카드 | rounded-2xl, p-5, border, v0 스타일 | ✅ LAYOUT.card, p-5 사용. 다크 시 #252631 등 인라인 | |
| Inbox 파싱 결과 블록 | "파싱된 일정" + "캘린더에 N개 추가" 버튼, 카드 토큰 | ⚠️ 버튼·라벨은 적용. 블록 자체는 `border-t` 로만 구분, 별도 카드(rounded-2xl·p-5) 래핑 없음 | 경미한 갭 |

**매칭**: 대부분 일치. Inbox 파싱 결과 영역만 카드 형태(rounded-2xl·p-5)로 감싸면 Design 4.5와 완전 일치.

---

### 1.5 검증·인수 조건

| 항목 | 상태 |
|------|------|
| `npx tsc --noEmit` 통과 | ✅ |
| 시간 가시성(몇 시~몇 시 한눈에) | ✅ |
| Inbox 단일 CTA·중복 제거 | ✅ |
| 타임테이블 발견(기본 뷰·라벨) | ✅ |
| 카드 위계(시간/제목/메타 분리) | ✅ (Inbox 파싱 블록만 소소한 보강 여지) |

---

## 2. 갭 요약

| 구분 | 항목 | 심각도 | 권장 조치 |
|------|------|--------|-----------|
| **Missing** | Design 옵션 A (파싱+캘린더 추가 한 번에) | 낮음 | 추후 개선 시 검토. 현재 Plan 범위 외 |
| **Minor** | Inbox 파싱 결과 블록을 카드(rounded-2xl, p-5)로 래핑 | 낮음 | 선택: 해당 View에 카드 클래스 적용 시 Design 4.5 완전 충족 |

**Match rate**: 필수 항목 기준 **약 95%** (옵션 A 제외, Inbox 파싱 블록 카드화는 선택).

---

## 3. 코드 리뷰

### 3.1 컨벤션·스타일

- **타입**: `any`/`@ts-ignore` 미사용. 이번 변경 구간에서 타입 안전성 유지됨.
- **네이밍**: 컴포넌트·함수·변수명이 기존 프로젝트 스타일과 일치 (camelCase, DAY_LABELS 등).
- **디자인 토큰**: Schedule 쪽에서 `colors.gray[900]`, `colors.brand.primary`, `isDark` 분기 사용 적절. Calendar·Inbox는 일부 `#252631`, `#d1d5db` 등 하드코딩 — design-system `surface.darkCard`, `colors.gray` 로 치환하면 유지보수에 유리 (선택).

### 3.2 접근성·UX

- **터치 영역**: 이벤트 카드 수정/삭제, 스케줄 시간 변경, Inbox 버튼 등 `min-h-[44px] min-w-[44px]` 또는 `h-12` 적용되어 있음.
- **accessibilityLabel**: "캘린더에 N개 추가", "구조화하기", "시간 변경" 등 주요 버튼에 설정됨.

### 3.3 구조·가독성

- **Calendar**: 이벤트 카드가 시간 → 제목 → 설명 순으로 명확. `theme` 분기 한 곳에서 처리.
- **Schedule**: `getEffectiveSlot` 재사용, `timeBlockText` 로 한글 요일·시간 포맷 통일. 다크/라이트 색 분기 `isDark`로 일관됨.
- **Inbox**: 파싱 플로우(parse → 리스트 → runAutoSchedule)와 구조화(parseAllEntries) 역할 구분이 코드상 명확함.

### 3.4 보안·에러

- 이번 변경은 UI/레이아웃 중심. 기존 API 호출(parse, runAutoSchedule, events insert) 경로와 검증 로직은 변경 없음.
- `parsedScheduleEvents.length` 등으로 N 표시, 빈 배열 시 runAutoSchedule 미호출 등 기존 가드 유지됨.

### 3.5 개선 제안 (선택)

1. **Calendar 이벤트 카드**: 배경/텍스트 색을 `colors.surface.darkCard`, `colors.gray[700]` 등 design-system으로 교체하면 테마 추가 시 일관성 좋아짐.
2. **Inbox 파싱 결과**: 해당 블록을 `View` + `className="rounded-2xl border ... p-5"` (및 다크 배경) 로 감싸서 Design 4.5 카드 스타일과 맞추기.
3. **Schedule 활동 행**: 다크 모드에서 "시간 변경" 버튼 테두리/배경을 `colors.gray[700]` 등 토큰으로 통일하면 다크 대비가 더 나음.

---

## 4. 결론 및 Next Steps

- **Design 대비 구현**: 필수 항목은 대부분 충족. Match rate 약 95%. 옵션 A 미구현과 Inbox 파싱 블록 카드화는 선택 개선.
- **코드 품질**: 컨벤션·접근성·구조 양호. 하드코딩 색을 design-system으로 바꾸면 유지보수성 향상.
- **Next Steps**:
  - (선택) 위 Minor 갭 반영: Inbox 파싱 결과 카드 래핑, Calendar/Schedule 색 토큰화.
  - **pdca report ux-simplify-and-monetization** 실행하여 완료 보고서 작성.
