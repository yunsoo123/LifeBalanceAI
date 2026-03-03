# Inbox + Timetable - Analysis

**Date**: 2025-02-23  
**Author**: gap-detector  
**Project**: Mendly (LifeBalanceAI)

**Design**: [inbox-timetable.design.md](../02-design/features/inbox-timetable.design.md)

---

## Overview

This report compares the Inbox + 타임테이블 (Inbox & Smart Calendar) design with the current implementation. The feature covers: one-line input → AI parse → parsed schedule list → Auto-Schedule button → timetable preview and event creation with "N Recurring Events Created" feedback.

Implementation scope: `app/api/inbox/parse-schedule+api.ts`, `app/api/inbox/auto-schedule+api.ts`, `lib/ai/parse-schedule.ts`, `lib/autoSchedulePlacement.ts`, `app/(tabs)/inbox.tsx`.

---

## Gap Analysis

### 1. API Contracts

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **Parse-schedule endpoint** | `POST /api/inbox/parse-schedule` | `POST` in `parse-schedule+api.ts` | **Match** |
| **Parse request** | `{ text: string }` | `BodySchema` with `text: z.string().min(1)` | **Match** |
| **Parse response** | `{ events: { title, days?, startTime?, endTime?, durationHours?, recurring? }[] }` | `{ events: validated }` via `ParsedScheduleEventSchema` | **Match** |
| **Parse validation** | Zod; &lt;3 events → "추가로 입력해 주세요" | Zod + `events.length < 3` → 400 with that message | **Match** |
| **Auto-schedule endpoint** | `POST /api/inbox/auto-schedule` | `POST` in `auto-schedule+api.ts` | **Match** |
| **Auto-schedule request** | `{ parsedEvents: ParsedEvent[] }` | `{ parsedEvents, weekStart? }` with `ParsedScheduleEventSchema` array | **Match** |
| **Auto-schedule logic** | 고정 일정 우선 → 빈 슬롯에 유연 활동, 충돌 시 다음 슬롯 | `placeParsedEvents()` in `lib/autoSchedulePlacement.ts` (fixed vs flexible, conflict skip) | **Match** |
| **Auto-schedule response** | `{ created: number, eventIds: string[] }` | `{ eventsToCreate }` (array of placement objects); no `created`/`eventIds` | **Gap** |
| **Auto-schedule DB** | "events insert, user_id, week_start 등 기존 규칙 준수" | Insert done **client-side** in `inbox.tsx` after API returns `eventsToCreate`; API does not insert | **Partial** |

**API summary**: Parse-schedule API matches. Auto-schedule API returns placement only; design expected API to perform insert and return `created` + `eventIds`.

---

### 2. Data Model & Lib

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **Parsed event shape** | title, days?, startTime?, endTime?, durationHours?, recurring? | `ParsedScheduleEventSchema` in `lib/ai/parse-schedule.ts` (same fields) | **Match** |
| **Parse from text** | AI parses one-line → 3+ events | `parseScheduleFromText(text)` with OpenAI JSON mode + schema parse | **Match** |
| **Placement: fixed first** | 고정 일정(요일·시간) 우선 | `placeParsedEvents()` splits fixed (has days+time) vs flexible | **Match** |
| **Placement: flexible in slots** | 유연 활동 빈 시간 배치 | Flexible events placed in `flexibleSlots` (9–11, 14–16, 19–21) | **Match** |
| **Conflict guard** | 충돌 시 첫 가능 슬롯 또는 다음 주 | `overlaps()` + skip; no "next week" extension in lib | **Partial** |
| **Output for insert** | events with start/end, user_id | `EventToCreate`: title, start_time, end_time, color; client adds user_id | **Match** |

**Data/lib summary**: Parsed schema and placement logic match design. Auto-schedule response shape and insert location differ (see API).

---

### 3. UI Structure & Components

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **Header** | 햄버거(≡) + "Inbox" + 캘린더 아이콘 (다크 배경, 흰 텍스트) | Title "Inbox" + subtitle only; no hamburger, no calendar icon | **Gap** |
| **QUICK NOTE** | 라벨 "QUICK NOTE" + 다중 줄 입력 또는 파싱 결과 영역 | Label "빠른 메모" / "QUICK NOTE" + one-line input; parsed result area below | **Match** |
| **일정으로 구조화** | "구조화하기" 또는 "파싱" → parse | "일정으로 구조화" button → `parseScheduleFromInbox()` → parse-schedule API | **Match** |
| **Parsed schedule list** | 3+ lines e.g. "학교 월수금 09:00-13:00", "알바 화목 18:00 (4시간)", "앱개발 공부 매일 2시간" | `parsedScheduleEvents` list with `formatParsedEventLine(ev, lang)` (title, days, time/duration) | **Match** |
| **Auto-Schedule button** | 보라색 풀폭, 번개 아이콘 + "Auto-Schedule" | Full-width button, `colors.brand.primary`, ⚡ + "Auto-Schedule" | **Match** |
| **Timetable preview** | Time \| Mon \| Tue \| Wed (…Thu–Sun), 09:00/13:00/18:00 rows, 셀에 색상 블록 + 라벨 | Flex-wrap of small cards (title + day + time), not grid with Time column + day columns | **Partial** |
| **EventBlock** | 작은 rounded 블록, title, 색상(goal/카테고리) | Inline `View` with `backgroundColor: ev.color + '40'`, title; no named `EventBlock` component | **Partial** |
| **Created feedback** | "N Recurring Events Created" + 초록 체크 | "N개 반복 일정 생성됨" / "N Recurring Events Created" + ✓ inside timetable card when `createdEventIds.length > 0` | **Match** |
| **Component split** | InboxScreen + QuickNoteSection, ParsedScheduleList, AutoScheduleButton, InboxTimetablePreview, CreatedFeedback | Single `InboxScreen` with inline sections; no named subcomponents | **Partial** |

**UI summary**: Flow and content match; header lacks hamburger/calendar; timetable is card list not grid; no extracted EventBlock/InboxTimetablePreview components.

---

### 4. Error Handling

| Requirement | Design | Implementation | Status |
|-------------|--------|-----------------|--------|
| **Parse failure** | 토스트 또는 인라인 "다시 입력해 주세요" | `Alert.alert` with error message + Retry button | **Match** |
| **Auto-Schedule failure** | "일정 저장에 실패했어요. 다시 시도해 주세요." + 재시도 버튼 | Alert "일정 저장 실패" / "Save failed" + Retry | **Match** |
| **Empty input Auto-Schedule** | 버튼 비활성화 또는 "먼저 한 줄을 입력하고 구조화해 주세요." | Button only shown when `parsedScheduleEvents.length > 0`; `runAutoSchedule` guards `parsedScheduleEvents.length === 0` | **Match** |

**Error summary**: All design error cases covered.

---

### 5. Security

| Requirement | Design | Implementation | Status |
|-------------|--------|----------------|--------|
| **RLS events** | `events` insert 시 `user_id` = auth.uid() | Client inserts with `user_id: user.id` from `supabase.auth.getUser()`; DB has RLS INSERT WITH CHECK (auth.uid() = user_id) | **Match** |
| **Rate limit** | 기존 AI 한도 통합: 파싱 1회, Auto-Schedule 1회당 1회 | Parse: `checkLimit('parses', isPro)` before calling API; Auto-Schedule: no rate limit in API or client | **Partial** |

**Security summary**: RLS matches. Auto-Schedule is not rate-limited per design.

---

### 6. Other / Bug

| Item | Design | Implementation | Status |
|------|--------|-----------------|--------|
| **Footer message** | "N Recurring Events Created" only after auto-schedule | Block `parsedCount > 0 && createdEventIds.length === 0` shows "N Recurring Events Created" using `parsedCount` (note-parsed count), not created events count | **Gap** (misleading copy) |

---

## Match Rate Summary

| Area | Implemented | Partial | Missing/Gap | Total | Rate |
|------|-------------|---------|------------|-------|------|
| API contracts | 7 | 1 | 1 | 9 | ~78% |
| Data model / lib | 5 | 1 | 0 | 6 | ~92% |
| UI / components | 5 | 3 | 1 | 9 | ~72% |
| Error handling | 3 | 0 | 0 | 3 | 100% |
| Security | 1 | 1 | 0 | 2 | ~75% |
| Other | 0 | 0 | 1 | 1 | 0% |
| **Total** | **21** | **6** | **3** | **30** | **~83%** |

- **Implemented (match)**: 21  
- **Partially implemented**: 6  
- **Missing / gap**: 3  

**Overall match rate: ~83%** (below 90% target).

---

## Recommended Actions

1. **Auto-schedule API contract**
   - Option A: Have the API perform `events` insert (with auth from session/header), return `{ created: number, eventIds: string[] }` and have the client only display result.
   - Option B: Keep client-side insert but align response: e.g. after client inserts, derive `created` and `eventIds` and document that response is effectively the same (or add a separate “apply” API that does insert and returns `created`/`eventIds`).

2. **Header**
   - Add hamburger (≡) and calendar icon to the Inbox header per design; keep dark background and white text in dark theme.

3. **Timetable preview**
   - Implement grid layout: Time column + Mon–Sun columns, time rows (e.g. 09:00, 13:00, 18:00), cells with color block + label (or extract `InboxTimetablePreview` + `EventBlock` and use grid there).

4. **Rate limiting**
   - Apply rate limit for Auto-Schedule (e.g. same as or separate from parse) in API or via existing usage limits so “1회당 1회” is enforced.

5. **Footer copy**
   - Remove or fix the block that shows “N Recurring Events Created” when `parsedCount > 0 && createdEventIds.length === 0`. That message should only reflect auto-schedule-created events (e.g. only show when `createdEventIds.length > 0` inside the timetable card, and do not use `parsedCount` for “Recurring Events Created”).

6. **Componentization (optional)**
   - Extract QuickNoteSection, ParsedScheduleList, AutoScheduleButton, InboxTimetablePreview, CreatedFeedback, and EventBlock for maintainability and design doc alignment.

---

## Next Steps

- **Iterate done**: Design §2.2/§5 반영, 헤더 햄버거+캘린더 추가, Footer 문구 수정.
- Re-run **analyze** then **pdca report**; or proceed to **Track 2 (calendar-drag-edit)**.
- If keeping current API (client-side insert): update the design doc to describe “API returns placement; client inserts and shows feedback” and document rate limit for Auto-Schedule.
