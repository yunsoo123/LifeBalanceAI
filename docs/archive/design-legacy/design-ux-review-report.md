# LifeBalance AI — Design/UX Review Report

**Scope:** `app/(tabs)/`, `components/ui/`, `lib/layoutConstants.ts`, `lib/design-system.ts`  
**Checklist:** Structure, Spacing, Typography, Touch targets; Dark mode.

---

## 1. Structure (Container & Card) — **PASS** (minor notes)

| Area | Result | Notes |
|------|--------|--------|
| **Tab bar** `_layout.tsx` | PASS | Uses `DARK_BG_COLOR` when dark; clear tab labels. |
| **Schedule** | PASS | Header card, input card, result cards, activity list in card. Error and empty states in containers. |
| **Inbox** | PASS | Header, Brain dump card, Quick note card, entry cards (`InboxEntryItem`), empty state inside `LAYOUT.card`. |
| **Calendar** | PASS | Header, calendar card, events section with cards, empty state in card, modal with card-style form. |
| **Notes** | PASS | Sidebar header, note list items card-like, editor with cover band; empty states in views. Event link modal has list rows. |
| **Review** | PASS | Header, week nav, main report card, AI section card. |
| **Profile** | PASS | Banner, Settings/Profile cards, usage card, sign-out CTA. |

**Minor:** Schedule empty state is inside a `View` with `mt-2` only (no card wrapper); acceptable for empty state. Optional: wrap in `LAYOUT.card` for consistency.

---

## 2. Spacing & Alignment — **PASS** (one consistency note)

- **layoutConstants:** `LAYOUT.gap`, `gapLg`, `cardGap`, `contentContainer` (px-6 py-8), `containerPadding` (px-6 py-6) are defined and used.
- **Screens:** Inbox, Calendar, Notes, Review, Profile use consistent padding (e.g. 24px horizontal, 24/20 top, 80–100 bottom). Cards use `p-4`–`p-6`, `mb-4`/`mb-5`/`mb-6`.
- **Schedule** uses `paddingHorizontal: 16` in `contentContainerStyle`; rest of app tends to use 24. **Suggestion:** Use `paddingHorizontal: 24` (or `LAYOUT`-derived value) for consistency.

---

## 3. Typography — **NEEDS FIX** (use LAYOUT tokens)

| File / Component | Issue | Fix |
|------------------|--------|-----|
| **schedule.tsx** | Header title uses `text-lg font-bold` instead of `LAYOUT.pageTitle`. | Use `LAYOUT.pageTitle` for "LifeBalance AI" or a dedicated screen title; keep subtitle as `LAYOUT.caption`. |
| **calendar.tsx** | Header uses `text-xs` + `text-xl font-extrabold` instead of LAYOUT. | Use `LAYOUT.caption` for "Schedule" and `LAYOUT.pageTitle` for "Calendar". |
| **profile.tsx** | "Settings" / "Profile" use ad-hoc `text-xs` and `text-xl font-extrabold`. | Use `LAYOUT.caption` and `LAYOUT.pageTitle` for hierarchy consistency. |
| **ResultCard.tsx** | Uses raw `text-lg`, `text-[13px]`, `text-3xl`, `text-sm`. | Optional: map to `LAYOUT.sectionTitle`, `LAYOUT.caption`, `LAYOUT.bodyText` where appropriate. |
| **EmptyState** | Title `text-[17px]`, description `text-[15px]`. | Optional: use `LAYOUT.sectionTitle` and `LAYOUT.bodyText` for consistency. |

---

## 4. Touch Targets (≥44pt iOS / ≥48dp Android) — **NEEDS FIX**

| Location | Issue | Fix |
|----------|--------|-----|
| **components/ui/Button.tsx** | `size="sm"` uses `min-h-[40px]` (below 44pt). | Change to `min-h-[44px]` for `sm`. |
| **calendar.tsx** | "Today" `Pressable` (line ~511) has no `minHeight`/`minWidth`. | Add `className="flex min-h-[44px] min-w-[44px] items-center justify-center"` (or equivalent style). |
| **calendar.tsx** | Month/Timetable toggle `Pressable`s (lines ~528, 538) use only `py-1.5`; effective height &lt; 44pt. | Add `min-h-[44px]` and center content (e.g. `items-center justify-center`). |
| **notes.tsx** | Event link modal "Done" and unlink "✕" are text-only with `hitSlop={8}`; touch area &lt; 44pt. | Wrap in a `Pressable` with `min-h-[44px] min-w-[44px]` or use `Button variant="ghost" size="sm"` (after Button sm fix). For "✕", use at least 44×44pt hit area. |
| **review.tsx** / **profile.tsx** / **notes.tsx** | Actions using `Button size="sm"` (Copy, Export, Prev/Next, Language, + New) render at 40px height. | Fixed once Button `sm` is updated to 44px. |

**Passing:** Schedule CTAs (56 / 48), Inbox buttons (min-h-12, 48×48), Calendar prev/next (44×44), event row edit/delete (44×44), Review share icon (48×48), Profile sign-out (h-14), Input (h-14), Button md/lg.

---

## 5. Dark Mode — **PASS**

- **Screens:** All tab screens set `SafeAreaView` style to `{ flex: 1, backgroundColor: DARK_BG_COLOR }` when `theme === 'dark'` and use `LAYOUT.screenBg` / `className` where applicable.
- **Tab bar:** `tabBarStyle.backgroundColor: isDark ? DARK_BG_COLOR : '#ffffff'`.
- **Headers/cards:** Use `#252631` or `dark:bg-zinc-*` and `dark:border-zinc-*` consistently.

---

## Summary

| Criterion | Result |
|-----------|--------|
| 1. Structure | **PASS** |
| 2. Spacing | **PASS** (align Schedule padding if desired) |
| 3. Typography | **NEEDS FIX** (use LAYOUT.pageTitle, sectionTitle, caption, bodyText where applicable) |
| 4. Touch targets | **NEEDS FIX** (Button sm → 44px; Calendar Today + Month/Timetable; Notes Done/✕) |
| 5. Dark mode | **PASS** |

**Recommended order of fixes:**  
1) Touch targets (Button.tsx sm, calendar Today + toggle, notes Done/✕).  
2) Typography (schedule, calendar, profile headers → LAYOUT tokens).  
3) Optional: Schedule horizontal padding 16 → 24; ResultCard/EmptyState LAYOUT tokens.

No business-logic changes were made or suggested; only layout, styling, and touch-target adjustments.
