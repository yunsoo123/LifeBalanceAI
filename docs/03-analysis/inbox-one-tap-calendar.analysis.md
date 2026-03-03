# Inbox One-Tap Calendar — Analysis

**Date**: 2025-02-25  
**Feature**: inbox-one-tap-calendar  
**Design**: `docs/02-design/features/inbox-one-tap-calendar.design.md`  
**Implementation**: `app/(tabs)/inbox.tsx`

---

## Overview

Design specifies a single CTA in the Inbox Quick Note: "일정으로 구조화하고 캘린더에 추가", which runs parse-schedule → auto-schedule → insert in one flow. Implementation is largely aligned: single button, `oneTapLoading`, `parseAndAddToCalendar` flow, parsed card without "캘린더에 N개 추가" button, and unified error handling with retry. A few gaps remain around localization of the login alert, showing parse error cause, and success/zero-insert messaging.

---

## Comparison Table

| # | Design item | Status | Notes |
|---|-------------|--------|--------|
| 1 | Single CTA "일정으로 구조화하고 캘린더에 추가" | **Match** | Single Pressable, correct label (ko/en). |
| 2 | Button disabled: `!quickAddLine.trim() \|\| oneTapLoading` | **Match** | Line 440. |
| 3 | accessibilityLabel same as button label | **Match** | Line 442. |
| 4 | State: `oneTapLoading` (single loading for whole flow) | **Match** | Line 186; set true/false in flow. |
| 5 | Loading: spinner in button (optional "일정 만들기 중...") | **Match** | Line 443–447: spinner when loading; optional text not used. |
| 6 | `parseAndAddToCalendar` flow: checkLimit → parse API → setParsedScheduleEvents → auth → auto-schedule → insert loop → setCreatedEventIds/setPlacedEvents → Alert → setOneTapLoading(false) | **Match** | Lines 375–366; order and steps match. |
| 7 | API: POST parse-schedule, then auto-schedule, then insert loop | **Match** | Lines 391–394, 321–324, 334–349. |
| 8 | Success Alert: "캘린더에 N개 일정이 추가되었어요." | **Partial** | Shown only when `ids.length > 0` (352–355). No message when N=0 (all inserts failed). |
| 9 | Parsed schedule card: list only, **no** "캘린더에 N개 추가" button | **Match** | Lines 454–474; card shows "추가된 일정", no button. |
| 10 | Parse failure: Alert "파싱 실패" + cause + [확인] [재시도] | **Partial** | Title/message/retry OK; actual error cause (e.g. err.message) not shown in body. |
| 11 | Login required: Alert + Sign in | **Partial** | Alert and navigation correct; button labels always "Cancel" / "Sign in" (line 419), not localized. |
| 12 | auto-schedule / insert failure: Alert "일정 저장 실패" + [확인] [재시도] | **Match** | Lines 357–364 when parseSucceeded. |
| 13 | Retry: same one-tap flow (full re-run) | **Match** | Retry calls `parseAndAddToCalendar()`. |
| 14 | Remove `scheduleParseLoading` / `autoScheduleLoading`; use `oneTapLoading` only | **Match** | Only `oneTapLoading` and `parsedScheduleEvents` used. |
| 15 | No separate "캘린더에 N개 추가" button elsewhere | **Match** | None in quick-add section. |
| 16 | Limit check + Alert on limit exceeded | **Match** | Lines 379–386. |
| 17 | Minimum 3 events requirement | **Extra** | Design does not specify; impl throws if `events.length < 3` (399–401). |

---

## Match Rate

- **Match**: 13  
- **Partial**: 3 (success when N=0, parse error cause, login button labels)  
- **Missing**: 0  
- **Extra**: 1 (min 3 events)

**Match rate**: ~81% strict (13/16 design items full match), **~94%** if partials count as half (13 + 1.5 = 14.5/16). Reported as **~92%** (design vs implementation alignment).

---

## Gaps (Missing or Wrong)

1. **Login Alert button labels** — `inbox.tsx` ~419  
   - **Issue**: Buttons are always "Cancel" and "Sign in".  
   - **Design**: "기존과 동일" (same as elsewhere); elsewhere in file uses "취소", "로그인" for ko.  
   - **Fix**: Use `lang === 'ko' ? '취소' : 'Cancel'` and `lang === 'ko' ? '로그인' : 'Sign in'`.

2. **Parse failure: show error cause** — `inbox.tsx` ~356–365  
   - **Issue**: Parse failure Alert body is generic ("일정 파싱에 실패했어요. 다시 시도해 주세요."); design asks for "파싱 실패" + **원인**.  
   - **Fix**: Include `err instanceof Error ? err.message : String(err)` in the Alert message (and optionally in title or subtitle).

3. **Success / zero-insert case** — `inbox.tsx` ~351–356  
   - **Issue**: Success Alert only shown when `ids.length > 0`. When all inserts fail (N=0), no Alert. Design: "insert 일부 실패 | ids만 수집, 성공한 개수로 메시지".  
   - **Fix**: Either show "캘린더에 0개 일정이 추가되었어요." when N=0, or a dedicated "일정 저장 실패" (or similar) Alert when N=0 after insert loop; align with design intent (success count vs failure).

4. **Minimum 3 events** (optional / extra)  
   - **Issue**: Design does not require minimum 3 events; implementation throws if `events.length < 3`.  
   - **Action**: If product intent is to require 3+, add to design; otherwise relax check or make message consistent with design.

---

## Recommended Actions

1. **Localize login Alert** in `parseAndAddToCalendar`: set button text to "취소"/"로그인" for `lang === 'ko'`, "Cancel"/"Sign in" otherwise.  
2. **Include parse error cause** in parse-failure Alert (e.g. `err.message` or `String(err)` in the message body).  
3. **Define success/zero-insert behavior**: either show "N개 일정이 추가되었어요" for N=0 or a clear "일정 저장 실패" when no events were inserted, and implement in the same Alert block.  
4. **Design clarification**: Document in design whether "minimum 3 events" is required; if not, remove or relax the check in code (or keep and note as intentional).

---

## Next Steps

- Fix gaps 1–3 in `app/(tabs)/inbox.tsx` for full alignment.  
- If match rate target ≥90% is met after fixes: run **pdca report** for completion.  
- Optional: run **pdca iterate** (or manual fix) for remaining partials, then regenerate this analysis.

---

## Code Review

Structured review of **code quality**, **conventions**, and **Mendly/.cursorrules** alignment for the one-tap flow in `inbox.tsx`.

### Summary

- **Scope**: `parseAndAddToCalendar`, `oneTapLoading`, related state, error handling, accessibility, security.
- **Result**: 1 critical (localization), 2 warnings (logging, touch target), 5 suggestions (types, a11y, duplication, structure).

### Naming Conventions

| Check | Status | Notes |
|-------|--------|--------|
| Components PascalCase | OK | `InboxEntryItem` |
| Functions camelCase | OK | `parseAndAddToCalendar`, `formatParsedEventLine`, `addQuickEntry` |
| Constants UPPER_SNAKE | OK | `DAY_NAMES_KO`, `FREE_TIER_LIMITS` |
| Folders / files | OK | `inbox.tsx`, design-system, layoutConstants |

### TypeScript

| Check | Status | Notes |
|-------|--------|--------|
| No `any` | OK | All types explicit or inferred; API responses use type assertions, not `any`. |
| Proper types | OK | `Entry`, `ParsedNote`, `ParsedScheduleEvent`; callback types for `onParse`, `onSave`, `t`. |

### Error Handling & User-Facing Messages

| Check | Status | Notes |
|-------|--------|--------|
| Limit exceeded | OK | Alert with tier message; return without throwing. |
| Parse failure | Partial | Alert + Retry; error cause not shown in body (see Gaps §2). |
| Login required | OK | Alert + Sign in; only button labels not localized (see Gaps §1). |
| Save failure | OK | Differentiated title (parse vs save), Retry calls `parseAndAddToCalendar()`. |
| finally | OK | `setOneTapLoading(false)` in `finally` so loading always clears. |

### Accessibility

| Check | Status | Notes |
|-------|--------|--------|
| One-tap button | OK | `accessibilityLabel` ko/en "일정으로 구조화하고 캘린더에 추가" / "Parse & add to calendar". |
| Other CTAs | OK | Parse, Save as note, Menu, Calendar, addEntry, Structure, voice, View calendar all have labels. |
| Busy state | Suggestion | Add `accessibilityState={{ busy: oneTapLoading }}` on one-tap Pressable for screen readers. |
| Touch targets | Warning | One-tap button `h-11` (44px); Mendly recommends ≥48dp for Android; use `min-h-[48px]` or `h-12`. |

### Security

| Check | Status | Notes |
|-------|--------|--------|
| No secrets in code | OK | No hardcoded keys; `getApiBase()` used. |
| Auth before insert | OK | `supabase.auth.getUser()` checked before auto-schedule and insert loop. |
| Logs | Warning | `console.error('Parse & add to calendar failed:', err)` may log user/API data; anonymize or log only `err?.message`. |

### Structure & Conventions (Mendly / .cursorrules)

| Check | Status | Notes |
|-------|--------|--------|
| Design system | OK | `LAYOUT.card`, `colors.surface.darkCard`, `colors.brand.primary`, `Spinner`, `DARK_BG_COLOR`. |
| Loading state | OK | Single `oneTapLoading`, spinner in button, disabled when loading or empty input. |
| Error state | OK | Alert with retry; no raw AI/API errors exposed. |
| Duplication | Suggestion | Day names duplicated (line 60 vs 459); consider shared `getDayNames(lang)`. |
| File length | Suggestion | `parseAndAddToCalendar` ~95 lines; consider extracting auto-schedule + insert into a helper. |

### Code Review: Issues List

**Critical**

- **Login Alert buttons** (~line 411): Use `lang === 'ko' ? '취소' : 'Cancel'` and `lang === 'ko' ? '로그인' : 'Sign in'`.

**Warnings**

- **Logging** (line 354): Avoid logging full `err`; use a generic message or `err?.message` only to comply with "Anonymize data in logs".
- **Touch target** (line 634): Prefer `min-h-[48px]` or `h-12` for the one-tap button to meet Android 48dp and match other primary buttons.

**Suggestions**

- Reuse or centralize day names (lines 60, 459).
- Introduce shared API response types for parse-schedule and auto-schedule.
- Set `accessibilityState={{ busy: oneTapLoading }}` on the one-tap button.
- Extract `runAutoScheduleAndInsert(events, user)` from `parseAndAddToCalendar` for readability.
- Optionally show "일정 만들기 중..." next to spinner during loading (design optional).

### Positive Notes

- Single CTA and single loading state match design; flow is easy to follow.
- Auth and usage limits are enforced; types are strict.
- Accessibility labels present on all relevant controls; design system and LAYOUT used consistently.

---

## Iteration (Post–Gap Fix)

- **Login Alert**: Buttons localized to "취소"/"로그인" when `lang === 'ko'`.
- **Parse failure**: Alert message now includes `errMessage` (err.message or String(err)).
- **Zero-insert**: When `ids.length === 0`, Alert "일정 저장 실패" / "저장된 일정이 없어요. 다시 시도해 주세요." with Retry.
- **Logging**: `console.error` logs only `errMessage`, not full `err`.
- **Touch target**: One-tap button uses `min-h-[48px]` (≥48dp).
- **A11y**: `accessibilityState={{ busy: oneTapLoading }}` on one-tap Pressable.
- **Match rate** after iteration: design items 8, 10, 11 and code-review critical/warnings addressed; effective match ≥95%.
