# 노트 사용성·시각 일관성 (Notes UX & Visual Overhaul) - Design

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Plan**: `docs/01-plan/features/real-device-feedback-improvements.plan.md` § 항목 4, §1-1

---

## Overview

노트 탭의 **(1) 첫 노트 만들기**, **(2) 일정 연결하기** 플로우를 명확히 하고, **(3) 페이지 전체**를 캡처·캘린더와 동일한 헤더·카드·네비 구조 및 design-system으로 통일한다. §1-1 사용자 피드백 반영.

---

## Plan §1-1 반영

| 구분 | 설계 반영 |
|------|------------|
| **첫 노트 만들기** | (1) 빈 상태에서 단일 CTA("첫 노트 만들기" / "+ 새 노트") 크게 배치. (2) 한 번의 탭으로 제목 입력 가능한 새 노트가 열리도록 플로우 단순화. (3) 목록 상단 "+ 새 노트" 버튼을 캡처·캘린더의 primary 액션과 동일한 시각적 위계로 통일. |
| **일정 연결하기** | (1) 노트 상세/편집 화면에서 "일정 연결"을 캡션+카드 또는 고정 액션으로 노출(숨겨진 메뉴에 두지 않음). (2) "이 노트를 캘린더 일정과 연결하면 리뷰에서 함께 볼 수 있어요" 등 한 줄 설명으로 가치 전달. (3) 연결된 일정이 있을 때만 보이던 블록을, **연결 전에도 "일정 연결" CTA**로 항상 보이게 하여 발견 가능성 확보. |
| **페이지 전체** | (1) 캡처·캘린더와 동일한 헤더 구조: 캡션+제목+primary 버튼. (2) 카드·여백·색 design-system·LAYOUT 통일(`borderRadius.xl`, `getSurface`, `colors.*`). (3) 목록→상세→편집 전환 최소화, "뒤로/저장/취소" 네비 일관. |
| **디자인 중구난방** | (1) 노트 탭 전체 동일 design-system 토큰. (2) EmptyState, Badge, Button 등 캡처/캘린더와 동일 variant·크기. (3) "지식 연결", "AI 요약" 등 섹션을 캘린더 이벤트 카드·캡처 결과 카드와 같은 시각 언어로 정리. |

---

## First Note Flow

- **빈 상태(목록에 노트 0개)**  
  - 화면 중앙에 단일 CTA: "첫 노트 만들기"(ko) / "Create your first note"(en).  
  - 터치 시: `createNewNote()` 호출 → 목록 갱신 → 해당 노트 상세/편집 화면으로 전환(제목 포커스 가능하면 포커스).  
  - 한 번의 탭으로 새 노트가 열리도록 구현(추가 확인 모달 없이).
- **목록에 노트 있음**  
  - 상단 헤더 옆 또는 하단 고정 영역에 "+ 새 노트" primary 버튼.  
  - 스타일: 캡처 "저장" 버튼과 동일 위계 — `getBrand('primary', theme)`, `minHeight: 48`, `borderRadius: borderRadius.md`.

---

## Event Link (일정 연결) Flow

- **위치**: 노트 **상세** 및 **편집** 화면 모두에서, 본문 위 또는 아래에 **항상** 노출.
- **연결 전**  
  - 블록 제목: "일정 연결"(ko) / "Link to calendar" (en).  
  - 한 줄 설명: "이 노트를 캘린더 일정과 연결하면 리뷰에서 함께 볼 수 있어요." / "Link this note to a calendar event to see it in your weekly review."  
  - CTA: "일정 선택" / "Choose event" → 기존 이벤트 선택 모달 오픈.
- **연결 후**  
  - 연결된 일정 1건 표시(제목, 날짜/시간 요약).  
  - "연결 해제" 또는 "다른 일정으로 변경" 액션 유지.
- **스타일**: 캡처 카드와 동일 — `getSurface('card', theme)`, `borderRadius.xl`, `borderColor`, 패딩 `spacing.lg`. 캡션은 `typography.fontSize.small` + `colors.text.tertiary`/`secondaryLight`.

---

## Page Structure (Notes)

### List Screen

- **Header**: 캡션(예: "노트") → 제목(예: "내 노트" / "My Notes") → 우측 또는 하단 primary "+ 새 노트".
- **Empty state**: 중앙 단일 CTA "첫 노트 만들기" (위 First Note Flow).
- **List**: 각 항목 카드 `getSurface('card', theme)`, `borderRadius.xl`, 터치 시 상세로 이동.

### Detail / Edit Screen

- **Header**: 뒤로가기 + 제목(또는 "노트 편집") + 저장(편집 시).
- **Body**: 제목 입력(편집 시) + 본문 + **일정 연결 블록(항상)** + (기존) 지식 연결·AI 요약 등.
- **Navigation**: "뒤로" / "저장" / "취소" 한 곳에서 일관된 스타일(design-system Button variant).

---

## Data / API

- 기존 `tables.notes()`, `event_id`(또는 `linked_event_ids`) 유지.  
- "일정 연결" 블록은 기존 `showEventLinkModal`, `availableEvents`, `toggleEventLink` 등 활용.  
- 변경 없음.

---

## Implementation Order

1. **시각 통일**(`schedule-notes-review-visual-overhaul.design.md` 적용 후): 노트 헤더, 카드, EmptyState 스타일.
2. **첫 노트 CTA**: 빈 상태 단일 CTA + "+ 새 노트" 상단/하단 primary 버튼; 한 번에 새 노트 열기.
3. **일정 연결 블록**: 상세/편집에 "일정 연결" 캡션+설명+CTA 항상 노출; 연결 전/후 UI 분기.
4. **네비 일관**: 뒤로/저장/취소 design-system 버튼으로 통일.

---

**Next Steps**: Do(구현) 후 gap analysis. 시각 부분은 `schedule-notes-review-visual-overhaul` 구현과 함께 적용 가능.
