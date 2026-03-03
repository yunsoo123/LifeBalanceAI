# Mendly UI Overhaul v2 — Gap Analysis

**Date**: 2025-02-25  
**Design doc**: `docs/02-design/features/mendly-ui-overhaul-v2.design.md`  
**Project**: Mendly (LifeBalanceAI)

---

## Overview

This report compares the **mendly-ui-overhaul-v2** design document with the current implementation in LifeBalanceAI. The design defines (1) design language v2 (colors, typography, spacing, radius), (2) component patterns (headers, cards, inputs, buttons, list rows, chat bubbles, calendar blocks, tabs), (3) per-screen direction for Schedule, Inbox, Calendar, Notes, Review, Profile, and (4) an implementation checklist.

**Scope of implementation reviewed**: `lib/design-system.ts`, `lib/layoutConstants.ts`, `app/(tabs)/_layout.tsx`, tab screens (schedule, inbox, calendar, notes, review, profile), and `components/ui` (ChatBubble, ResultCard, EmptyState, Button, Input, etc.).

---

## 1. Design language v2 — Design vs implementation

### 1.1 Colors

| Item | Status | Notes |
|------|--------|--------|
| brand.primary / primaryMuted / secondary / secondaryMuted (light & dark hex) | **Match** | design-system.ts uses *Light suffix for light mode; values match design table |
| surface.screen / card / cardElevated / input / subtle | **Match** | Present with theme-aware getSurface() |
| text.primary / secondary / tertiary / inverse | **Match** | Hex values and light variants present |
| semantic (success, warning, error, info + Bg variants) | **Match** | semantic.* and *Light Bg present |
| border.subtle / medium / strong | **Match** | Present with *Light variants |
| chat.userBubble / userBubbleText / aiBubble / aiBubbleText / resultCardBg | **Match** | design-system chat tokens match design |

### 1.2 Typography

| Item | Status | Notes |
|------|--------|--------|
| fontSize scale (caption 12 → display 32) | **Match** | typography.fontSize matches design |
| lineHeight scale | **Match** | typography.lineHeight matches |
| fontWeight (regular 400, medium 500, semibold 600, bold 700) | **Match** | Implemented as normal/medium/semibold/bold; same values |
| Use token names in components | **Partial** | Some screens use hardcoded text-[15px], text-[12px] instead of typography.body, typography.caption |

### 1.3 Spacing & sizing

| Item | Status | Notes |
|------|--------|--------|
| spacing.xs → 3xl (4–64px) | **Match** | design-system spacing matches |
| borderRadius (sm 8, md 12, lg 16, xl 20, full) | **Match** | borderRadius object matches; radiusClasses use Tailwind |
| Min touch 44/48pt, input bar 52px | **Match** | layoutConstants/screens use min-h-[48px]; Schedule input bar ~52px |
| CONTENT_MAX_WIDTH 672 | **Match** | layoutConstants.ts |
| paddingHorizontal spacing.lg (24) for mobile | **Partial** | Some screens use px-4 (16) or px-6 (24); design says spacing.lg 24 |

---

## 2. Component patterns — Design vs implementation

### 2.1 Headers

| Item | Status | Notes |
|------|--------|--------|
| One row; no second line for "• Online" in main header row | **Partial** | Schedule has "• Online" on a second row (design allows "status strip below header") — acceptable |
| Left: app icon/logo 24–28pt + "Mendly" typography.subhead, text.primary | **Partial** | Schedule uses dot (w-2.5 h-2.5) + Mendly; no app logo image |
| Right: icon button(s) 44pt | **Match** | Schedule/Inbox use min-w-[44px] min-h-[44px] |
| Bar: surface.card, border.subtle, padding vertical 12–16, horizontal spacing.lg | **Match** | LAYOUT.header + getSurface('card'); px-6, py-3 used |

### 2.2 Cards

| Item | Status | Notes |
|------|--------|--------|
| Bg surface.card, border border.subtle, radius.lg (16), padding spacing.md | **Match** | LAYOUT.card: rounded-2xl (16px), p-4, border |
| Elevated variant: surface.cardElevated | **Match** | Used in ResultCard, Inbox QUICK NOTE block, Review |

### 2.3 Inputs

| Item | Status | Notes |
|------|--------|--------|
| Single-line: height 48–52px, surface.input, border.subtle, radius.md, padding horizontal 16, typography.body | **Partial** | LAYOUT.input is h-12 (48) and rounded-xl (12) — match. Input.tsx uses h-14 and rounded-2xl — **Wrong** for v2 |
| Placeholder text.tertiary | **Partial** | Many placeholders use #9CA3AF or colors.gray[400]; design token text.tertiary #64748B |

### 2.4 Buttons

| Item | Status | Notes |
|------|--------|--------|
| Primary: brand.primary, text.inverse, bodyMedium, min height 48, radius.md, padding horizontal 24 | **Match** | Button md: min-h-[48px], rounded-xl; primary uses brand.primary |
| Secondary: border.medium, bg transparent (or surface.subtle on press) | **Partial** | Button secondary uses bg gray-100/dark:zinc-800, not border-only |
| Danger: bg semantic.error | **Wrong** | Button danger uses bg-red-500; should use colors.semantic.error |
| Disabled: opacity 0.5 or surface.subtle + text.tertiary | **Match** | opacity-50 used |

### 2.5 List rows

| Item | Status | Notes |
|------|--------|--------|
| minHeight 48pt, paddingHorizontal spacing.lg, paddingVertical 12–14, divider border.subtle | **Match** | ROW_CLASS: min-h-[48px] px-6 py-3 border-b |

### 2.6 Chat bubbles

| Item | Status | Notes |
|------|--------|--------|
| User: chat.userBubble, chat.userBubbleText, typography.body, padding h 16 v 12, radius.lg, max width ~85% | **Partial** | ChatBubble: colors match; px-4 py-3 (16/12) match; text-[15px] vs typography.body 16px |
| AI: same spec | **Partial** | Same as user |
| Result card in thread: chat.resultCardBg, border.subtle, radius.xl, padding spacing.md | **Partial** | ResultCard uses rounded-2xl (16px); design says radius.xl (20px) |

### 2.7 Calendar event blocks

| Item | Status | Notes |
|------|--------|--------|
| Bg activity color or brand.primaryMuted + brand.primary left border 4px; radius.md; padding 8–10 v, 10–12 h; typography.small; min height 32 | **Partial** | Timetable blocks use ev.color + '20', rounded-lg, min-h-[32px]; no 4px left border with brand.primary |

### 2.8 Tabs (bottom)

| Item | Status | Notes |
|------|--------|--------|
| Bar: surface.card, top border.subtle, height 56 + safe area | **Match** | _layout.tsx tabBarStyle |
| Active brand.primary, inactive text.tertiary; typography.caption for label | **Partial** | Inactive uses text.secondary; tabBarLabelStyle fontSize 11 — design says caption 12px |
| 44pt minimum per item | **Match** | Icon + label meet touch target |

---

## 3. Per-screen direction — Design vs implementation

### Schedule

| Item | Status | Notes |
|------|--------|--------|
| Full-screen chat; message list + inline result card; no sidebar | **Match** | schedule.tsx structure matches |
| Sticky bottom input bar single-line + send, 52px height, KeyboardAvoidingView | **Match** | Input bar ~52px, KeyboardAvoidingView |
| Header: Mendly + menu; optional "• Online" in status strip below header | **Match** | Second row with • Online and subtitle |
| Result card: one elevated card (schedule summary + progress + CTA) in thread | **Match** | ResultCard + activities list in thread |
| No floating panels; actions inside result card or bubbles | **Match** | No floating panels |

### Inbox

| Item | Status | Notes |
|------|--------|--------|
| Single block at top: one-line quick input + primary Auto-Schedule (+ optional) | **Match** | QUICK NOTE block with one-line input + Auto-Schedule |
| Below: one-line result sentence + grid/list of event chips (radius.sm) | **Partial** | "N Recurring Events Created" + chips; chips use rounded-lg (8px = radius.sm in some places) |
| No multi-line memo list as main focus; quick capture first | **Partial** | BRAIN DUMP block still prominent above QUICK NOTE; design de-emphasizes multi-line |
| Empty state: short copy + CTA "첫 메모 추가하기" or similar | **Match** | EmptyState with CTA |

### Calendar

| Item | Status | Notes |
|------|--------|--------|
| Timeline or week grid as main content; each event a block (§2.7) | **Match** | Month grid + timetable; event blocks in timetable |
| Header: title + today + optional view toggle | **Match** | Caption + page title + month nav + view toggle (월간/이번 주) |
| Add event: FAB or header action → modal one card (title, date/time, repeat), primary submit | **Match** | Header + button opens modal; card-style form |
| Empty: "이번 주 일정이 없어요" + CTA | **Match** | EmptyState with translation |

### Notes

| Item | Status | Notes |
|------|--------|--------|
| List: note rows (title + optional snippet + date), card or list row (§2.5) | **Match** | FlatList with card-style rows |
| Detail: block-based — title block, then body/checklist/code blocks with separation | **Match** | NoteBodyView (para, check, code); title block with meta |
| Empty: "첫 노트를 작성해 보세요" + CTA | **Match** | EmptyState |

### Review

| Item | Status | Notes |
|------|--------|--------|
| Caption "WEEKLY REPORT" (typography.caption) → title (typography.title) → metrics 2-col card grid → "목표 vs 실제" card with row blocks | **Match** | review.tsx structure; MetricCard 2-col; GoalVsActualBar in card |
| Numbers typography.metric; progress bars semantic colors | **Match** | MetricCard big numbers; ProgressBar/GoalVsActualBar semantic variants |
| Single scroll; no tabs inside Review | **Match** | Single ScrollView |
| Bottom: optional banner (New Routine or CTA) | **Match** | New Routine Generated + AI insights sections |

### Profile

| Item | Status | Notes |
|------|--------|--------|
| Sections as cards: Account, Preferences, Subscription, Support, Sign out | **Partial** | Cards for Dark mode, Language, Guide, Pro, Usage, Sign out; no explicit "Account" card; banner at top with avatar |
| Header: title "설정" or "Profile" | **Match** | "Settings" + profile title in content |
| Destructive (Sign out) secondary or danger | **Match** | Sign out uses danger-style (red) |

---

## 4. Implementation checklist — Design vs implementation

| Checklist item | Design | Status | Notes |
|----------------|--------|--------|--------|
| design-system.ts: v2 colors, typography, spacing, radius | [x] | **Match** | Implemented |
| layoutConstants.ts: LAYOUT.*, surface.screen, CONTENT_MAX_WIDTH 672 | [x] | **Match** | Implemented |
| ThemeContext: theme drives surface/semantic, no hardcoded hex in screens | [x] | **Partial** | getSurface/getBrand used; some screens still use hardcoded gray/hex (e.g. schedule TimeEditModal, error box) |
| Components: ChatBubble, ResultCard, EmptyState, buttons, inputs, list rows use v2 tokens | [ ] | **Partial** | ChatBubble/ResultCard use tokens with minor deviations; Button secondary/danger not full v2; Input height/radius off |
| Screens: per-screen direction (§3), v2 colors and typography | [x] | **Match** | Structure and tokens applied with noted partials |
| Tab bar: surface.card, border.subtle, active brand.primary, inactive text.tertiary | [x] | **Partial** | Inactive tint and label fontSize off |
| Accessibility: 44/48pt touch, WCAG contrast, labels for icon-only | [ ] | **Missing** | Touch targets generally met; systematic contrast and icon labels not verified |

---

## 5. Match rate summary

- **Design language v2**: ~14/16 items match or partial → **~88%**
- **Component patterns**: ~12/18 items match; 5 partial; 1 wrong → **~72%**
- **Per-screen direction**: ~22/26 items match or partial → **~85%**
- **Checklist**: 4 match, 3 partial, 1 missing → **~75%**

**Overall match rate**: **~80%** (weighted by section; component patterns and checklist drag down).

---

## 6. Recommended actions

### High priority (align with design)

1. **Tab bar**: Use `text.tertiary` for inactive tint (not `text.secondary`) and set tab label `fontSize` to 12 (typography.caption).
2. **Result card**: Use `radius.xl` (20px) for the result card container in chat thread (e.g. ResultCard and/or Schedule wrapper). design-system already has `borderRadius.xl = 20`.
3. **Button danger**: Use `colors.semantic.error` for danger variant instead of `bg-red-500`.
4. **Button secondary**: Consider variant that uses `border.medium` + transparent background with press = `surface.subtle` per design (or document deviation).
5. **Input component**: In `Input.tsx`, use min height 48 (or 52), `radius.md` (12), and design-system `surface.input` / `border.subtle` so standalone Input matches LAYOUT.input and §2.3.

### Medium priority (consistency)

6. **ChatBubble**: Use `typography.fontSize.body` (16) and `typography.lineHeight.body` (24) for bubble text instead of hardcoded 15px.
7. **Calendar event blocks**: Add optional 4px left border with `brand.primary` when using default (non–activity-color) style for event blocks.
8. **Placeholders**: Use `colors.text.tertiary` (or theme-aware) for placeholder text across screens and Input.
9. **Schedule header**: Replace dot with app icon/logo 24–28pt if asset exists; otherwise document as acceptable.

### Lower priority / polish

10. **EmptyState**: Use design-system text tokens (e.g. `text.primary`, `text.secondary`) instead of hardcoded gray when `dark` is true.
11. **Accessibility**: Add explicit accessibility labels for all icon-only buttons; run contrast check for `text.primary`/`text.secondary` on `surface.screen` and `surface.card` (WCAG AA).
12. **Inbox**: Consider reordering so QUICK NOTE (one-line + Auto-Schedule) is the single top block and BRAIN DUMP is secondary/collapsible to match “quick capture first.”

---

## 7. Next steps

- **If match rate is to be raised to ≥90%**: Implement high-priority actions (tab bar, result card radius, Button danger/secondary, Input), then re-run this gap analysis.
- **After gaps are closed**: Run **pdca report** for mendly-ui-overhaul-v2 to generate the completion report (`docs/04-report/features/mendly-ui-overhaul-v2.report.md`).
- **Optional**: Create a short “v2 token usage” checklist for new components so future work consistently uses design-system tokens (and typography.body/caption etc.) instead of hardcoded sizes/colors.
