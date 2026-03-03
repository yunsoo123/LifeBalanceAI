# 캡처·스케줄 통합 + To-Do 리뉴얼 — Analysis (갭 분석)

**Date**: 2026-02-22  
**Author**: PDCA  
**Project**: Mendly (LifeBalanceAI)  
**Design**: [capture-schedule-todo-renewal.design.md](../../02-design/features/capture-schedule-todo-renewal.design.md)  
**Plan**: [capture-schedule-todo-renewal.plan.md](../../01-plan/features/capture-schedule-todo-renewal.plan.md)

---

## Overview

Design 문서와 현재 구현을 비교한 갭 분석이다. 전반적으로 설계가 반영되어 있으며, **할 일 삭제 UI**와 **할 일 목록 필터(당일/미배정)** 미구현이 갭으로 남아 있다.

---

## 1. 일치 항목 (Match)

| Design 항목 | 구현 위치 | 비고 |
|-------------|-----------|------|
| **탭 5개** (Capture \| Calendar \| Notes \| Review \| Profile) | `app/(tabs)/_layout.tsx` | inbox, schedule은 `href: null`로 숨김 |
| **inbox → capture 리다이렉트** | `app/(tabs)/inbox.tsx` | `Redirect href="/(tabs)/capture"` |
| **schedule → capture/schedule 리다이렉트** | `app/(tabs)/schedule.tsx` | `Redirect href="/(tabs)/capture/schedule"` |
| **첫 진입 경로** (index, sign-in, onboarding → capture) | `app/index.tsx`, `sign-in.tsx`, `onboarding.tsx` | `/(tabs)/capture` 로 이동 |
| **todos 테이블** (스키마, RLS, 인덱스, trigger) | `supabase/migrations/20260222000000_todos.sql` | Design §5와 동일 |
| **database.types.ts / tables.todos()** | `types/database.types.ts`, `lib/supabase/client.ts` | 반영됨 |
| **Capture 탭: quick-add 한 줄** | `app/(tabs)/capture/index.tsx` | placeholder `t.capture.placeholder` |
| **Capture: 배치 선택 모달** (일정만 / 할 일만 / 둘 다) | `capture/index.tsx` (Modal, Placement) | `t.capture.placement*` 사용 |
| **Capture: Parse + events insert** (일정만/둘 다) | parse-schedule → auto-schedule → events insert | 기존 API 재사용 |
| **Capture: todos insert** (할 일만/둘 다) | `tables.todos().insert()` | 구현됨 |
| **AI 주간 일정 진입** (Capture 내) | `capture/index.tsx` → `router.push('/(tabs)/capture/schedule')` | 버튼으로 진입 |
| **Schedule 결과 → 배치 선택** (일정만/할 일만/둘 다) | `capture/schedule.tsx` (placement modal, insert events/todos) | 구현됨 |
| **Calendar 탭: 세그먼트 "일정 \| 할 일"** | `calendar/index.tsx` (`calendarSegment`: 'events' \| 'todos') | 상단 전환 버튼 |
| **Calendar: 할 일 리스트** | `calendar/index.tsx` (todos state, loadTodos) | 세그먼트 'todos' 시 표시 |
| **할 일 완료 토글** | 체크박스 탭 → `tables.todos().update({ completed })` | 구현됨 |
| **할 일 추가** ("+ 할 일 추가" 버튼 + 인라인 입력) | `setTodoInputVisible`, `newTodoTitle`, insert 후 loadTodos | 구현됨 |
| **i18n** (capture.*, todo.*, placement*) | `lib/i18n.tsx` | 한/영 문구 있음 |
| **가이드 문구** (Capture 설명) | `guide.tsx` + i18n inboxTitle/inboxBody → "Capture" | 갱신됨 |
| **Quality** (tsc, lint) | 이전 세션에서 통과 | — |

---

## 2. 미구현/불일치 (Gap)

| 항목 | Design 기준 | 현재 구현 | 권장 조치 |
|------|-------------|-----------|------------|
| **할 일 삭제** | §6: "할 일 삭제: Supabase todos delete, **스와이프 또는 메뉴**" | 할 일 행에 삭제 UI 없음. 완료 토글만 있음. | Calendar "할 일" 리스트에서 **롱프레스 또는 행 메뉴로 삭제** 추가. (스와이프 삭제는 선택) |
| **할 일 목록 필터** | §7.2: "**당일 또는 미배정+당일** 할 일 리스트" | `loadTodos`에서 `user_id`만으로 전체 조회, `order('created_at', { ascending: false })`. due_date 필터 없음. | (선택) "오늘" / "전체" 필터 추가하거나, 당일(due_date = today or null)만 보기 옵션 제공. 현재는 "전체 목록"으로도 사용 가능하므로 우선순위 낮음. |
| **todos.event_id 연결** | §5: "둘 다일 때 동일 제목의 event와 연결". §5.2 "필요 시 todos.event_id로 연결" | Capture에서 "둘 다" 선택 시 events 여러 개 생성 가능하지만, todo 1개만 넣고 **event_id는 설정하지 않음**. | 설계상 "필요 시"이므로 **선택 구현**. 나중에 "이 할 일에 대응하는 일정" 링크를 보여주려면 그때 event_id 저장 로직 추가. |

---

## 3. 기타 (Extra / 참고)

- **Capture 최근 캡처**: Design §7.1 "최근 캡처: 제거하거나 5개 이하 짧은 리스트만 (선택 구현)". 현재 Capture index에는 최근 캡처 리스트 없음 → Design 선택안에 맞춤.
- **세그먼트 라벨**: Calendar에서 "일정"이 `t.calendar.today === '오늘' ? '일정' : 'Calendar'` 로 되어 있음. i18n에 "일정" 키가 있으면 통일 권장.

---

## 4. 매치율 및 요약

| 구분 | 개수 | 비고 |
|------|------|------|
| 일치 | 20+ 항목 | 탭 구조, 라우팅, DB, Capture/Calendar/할 일 CRUD(삭제 제외), i18n, 품질 |
| 미구현 | 1개 (할 일 삭제) | 스와이프 또는 메뉴로 삭제 |
| 선택/부분 | 2개 | 당일 필터, event_id 연결 |

**매치율**: 약 **90%** (핵심 플로우·데이터·UI 대부분 반영. 삭제 UI만 명시적 갭.)

---

## 5. 권장 조치 (Act)

1. **필수**: Calendar 탭 "할 일" 뷰에서 **할 일 삭제** 가능하도록 하기  
   - 예: 할 일 행 **롱프레스** 시 Alert "삭제할까요?" → `tables.todos().delete().eq('id', item.id)` 후 `loadTodos()`  
   - 또는 행 옆 메뉴(⋯) → "삭제" 액션.
2. (선택) 할 일 목록에 "오늘" / "전체" 필터 추가.  
3. (선택) "둘 다" 저장 시 생성된 event 하나와 todo를 `event_id`로 연결.

---

## 6. Next Steps

- **Act**: 위 권장 조치 1(할 일 삭제 UI) 적용 후, 필요 시 **iterate**로 재분석.  
- **Report**: 갭 수정 완료 후 `docs/04-report/features/capture-schedule-todo-renewal.report.md` 작성.
