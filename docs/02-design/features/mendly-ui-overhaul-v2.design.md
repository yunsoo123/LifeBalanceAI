# Mendly UI Overhaul v2 — Visual & UX Direction (Full Rebuild)

**Date**: 2025-02-25  
**Project**: Mendly (LifeBalanceAI)  
**Scope**: Full app tear-down and rebuild — design language v2, component patterns, per-screen direction.  
**Reference files**: `lib/design-system.ts`, `lib/layoutConstants.ts`

---

## 1. Design language v2

### 1.1 Colors

**Primary palette (v2: indigo–slate, single primary)**

| Token | Light | Dark | Use |
|-------|--------|------|-----|
| `brand.primary` | `#4F46E5` | `#6366F1` | CTA, links, active tab |
| `brand.primaryMuted` | `#EEF2FF` | `#312E81` | Primary tint bg, selected chip |
| `brand.secondary` | `#0D9488` | `#14B8A6` | Accent, success highlight, • Online |
| `brand.secondaryMuted` | `#CCFBF1` | `#134E4A` | Secondary tint bg |

**Backgrounds & surfaces**

| Token | Light | Dark | Use |
|-------|--------|------|-----|
| `surface.screen` | `#F8FAFC` | `#0F172A` | Full-screen bg (replaces `DARK_BG_COLOR` / `LIGHT_BG_COLOR`) |
| `surface.card` | `#FFFFFF` | `#1E293B` | Cards, modals, header bar |
| `surface.cardElevated` | `#FFFFFF` | `#334155` | Result card, floating panel |
| `surface.input` | `#F1F5F9` | `#1E293B` | Input bg, chat input bar |
| `surface.subtle` | `#F1F5F9` | `#0F172A` | List row hover, separator area |

**Text**

| Token | Light | Dark | Use |
|-------|--------|------|-----|
| `text.primary` | `#0F172A` | `#F8FAFC` | Headings, body emphasis |
| `text.secondary` | `#475569` | `#94A3B8` | Body, descriptions |
| `text.tertiary` | `#64748B` | `#64748B` | Captions, labels, placeholders |
| `text.inverse` | `#FFFFFF` | `#0F172A` | On primary/secondary buttons, user bubble |

**Semantic**

| Token | Light & Dark | Use |
|-------|----------------|-----|
| `semantic.success` | `#059669` | • Online, checkmarks, positive metrics |
| `semantic.successBg` | `#D1FAE5` / `#064E3B` | Success chip, safe badge |
| `semantic.warning` | `#D97706` | Warnings, near-limit |
| `semantic.warningBg` | `#FEF3C7` / `#78350F` | Warning chip |
| `semantic.error` | `#DC2626` | Errors, over budget, destructive |
| `semantic.errorBg` | `#FEE2E2` / `#7F1D1D` | Error chip, danger zone |
| `semantic.info` | `#2563EB` | Info messages, links |

**Borders**

| Token | Light | Dark |
|-------|--------|------|
| `border.subtle` | `#E2E8F0` | `#334155` |
| `border.medium` | `#CBD5E1` | `#475569` |
| `border.strong` | `#94A3B8` | `#64748B` |

**Chat (v2 — aligned to surfaces)**

| Token | Light | Dark |
|-------|--------|------|
| `chat.userBubble` | `#4F46E5` | `#6366F1` |
| `chat.userBubbleText` | `#FFFFFF` | `#FFFFFF` |
| `chat.aiBubble` | `#E2E8F0` | `#334155` |
| `chat.aiBubbleText` | `#0F172A` | `#F8FAFC` |
| `chat.resultCardBg` | `#F1F5F9` | `#334155` |

**Implementation note**: In `lib/design-system.ts`, replace current `colors` with the above. Keep export shape (`colors.brand`, `colors.surface`, etc.) and add `semantic` if not present. Use hex in the object; Tailwind/RN class helpers can remain for compatibility.

---

### 1.2 Typography (v2)

**Font stack**

- **Headings & body**: `Inter` (Latin), `Pretendard` (Korean) — same as .cursorrules.
- **Monospace**: `JetBrains Mono` (code blocks, optional).

**Scale (numeric for RN `fontSize` / `lineHeight`)**

| Token | Size (px) | Line height | Weight | Use |
|-------|-----------|-------------|--------|-----|
| `typography.caption` | 12 | 16 | 500 | Labels, QUICK NOTE, WEEKLY REPORT, tab labels |
| `typography.small` | 14 | 20 | 400 | Secondary body, list metadata |
| `typography.body` | 16 | 24 | 400 | Default body, chat, inputs |
| `typography.bodyMedium` | 16 | 24 | 500 | Emphasized body, button label |
| `typography.subhead` | 18 | 26 | 600 | Section titles, card titles |
| `typography.title` | 20 | 28 | 700 | Screen title, modal title |
| `typography.titleLarge` | 24 | 32 | 700 | Hero (e.g. Review header) |
| `typography.metric` | 28 | 34 | 700 | Big numbers (42h, 78%) |
| `typography.display` | 32 | 40 | 700 | Rare, marketing |

**Weights**

- `regular: '400'`, `medium: '500'`, `semibold: '600'`, `bold: '700'`.

**Implementation**: In `lib/design-system.ts`, set `typography.fontSize` and `typography.lineHeight` to the above numeric values; keep `fontWeight` as-is. Use token names in components (e.g. `fontSize: typography.fontSize.body`).

---

### 1.3 Spacing & sizing (v2)

**Spacing scale (px)**

| Token | Value | Use |
|-------|--------|-----|
| `spacing.xs` | 4 | Icon–text gap, tight padding |
| `spacing.sm` | 8 | Inline gaps, list row padding |
| `spacing.md` | 16 | Card padding, section gap |
| `spacing.lg` | 24 | Screen horizontal padding, section spacing |
| `spacing.xl` | 32 | Large section gap |
| `spacing.2xl` | 48 | Hero spacing, bottom sheet top padding |
| `spacing.3xl` | 64 | Max content padding |

**Border radius (px)**

| Token | Value | Use |
|-------|--------|-----|
| `radius.sm` | 8 | Chips, tags, small buttons |
| `radius.md` | 12 | Inputs, list rows, event blocks |
| `radius.lg` | 16 | Cards, modals, bubbles |
| `radius.xl` | 20 | Result card, large panels |
| `radius.full` | 9999 | Pills, avatars |

**Touch & layout**

- Minimum touch target: **44pt** (iOS) / **48dp** (Android). Buttons and list rows: `minHeight: 48`.
- Input bar height: **52px** (single line + padding).
- Tab bar: keep current safe-area height; icon + label spacing from `spacing.sm`.

**Content width**

- `CONTENT_MAX_WIDTH`: keep **672** for tablet/centered content; mobile full-bleed with `paddingHorizontal: spacing.lg` (24).

**Implementation**: In `lib/layoutConstants.ts`, add or replace with v2 tokens. In `lib/design-system.ts`, set `spacing` and `borderRadius` (and optional `radius` for class names) to the above.

---

## 2. Component patterns (v2)

### 2.1 Headers

- **Structure**: One row; no second line for "• Online" in the main header row (move to Schedule-only or status strip).
- **Left**: App icon/logo (24–28pt) + app name ("Mendly") using `typography.subhead`, `text.primary`.
- **Right**: Icon button(s), 44pt touch target, `surface.card` bg (or transparent). Optional: menu (⋮), calendar, etc.
- **Bar**: `surface.card` bg, border-bottom `border.subtle`, padding vertical 12–16, horizontal `spacing.lg`.
- **No back button on tab roots**; use Expo Router back only on stack screens.

**Token map**: `LAYOUT.header` → `surface.card` + `border.subtle` + `paddingVertical: 12`, `paddingHorizontal: spacing.lg`.

---

### 2.2 Cards

- **Structure**: Single container; no nested card-in-card unless defined (e.g. result card inside chat).
- **Visual**: Bg `surface.card`, border `border.subtle`, radius `radius.lg` (16px), padding `spacing.md` (16). Elevated variant: `surface.cardElevated`, optional shadow (e.g. `shadow.md`).
- **Usage**: List item card, metric card, settings group, modal content. One card = one concept (노션-style block).

**Token map**: `LAYOUT.card` → `surface.card` + `border.subtle` + `radius.lg` + `p-4` (or `spacing.md`).

---

### 2.3 Inputs

- **Single-line**: Height 48–52px, bg `surface.input`, border `border.subtle`, radius `radius.md`, padding horizontal 16, `typography.body`, placeholder `text.tertiary`.
- **Multi-line**: Min height 96px, same bg/border/radius, padding 16, `typography.body`.
- **Focus**: Border `border.medium` or `brand.primary` 2px ring (no heavy glow).

**Token map**: `LAYOUT.input` → h-12 (48), `surface.input`, `border.subtle`, `radius.md`, `typography.body`.

---

### 2.4 Buttons

- **Primary**: Bg `brand.primary`, text `text.inverse`, `typography.bodyMedium`, min height 48, radius `radius.md`, padding horizontal 24. Disabled: opacity 0.5 or `surface.subtle` + `text.tertiary`.
- **Secondary**: Border `border.medium`, bg transparent (or `surface.subtle` on press), text `text.primary`. Same size and radius.
- **Ghost**: No border, bg transparent; press = `surface.subtle`. For list actions, icon-only.
- **Danger**: Same as primary but bg `semantic.error`.

---

### 2.5 List rows

- **Structure**: One row per item; optional leading icon/avatar, title (subhead or body), trailing chevron or action. Min height 48pt.
- **Visual**: Bg `surface.card` (or transparent with divider). Divider: `border.subtle`, 1px, full width or inset by `spacing.lg`. Padding horizontal `spacing.lg`, vertical 12–14.
- **Tap**: Highlight `surface.subtle` (or opacity 0.7) on press.

**Token map**: `ROW_CLASS` or equivalent → `minHeight: 48`, `paddingHorizontal: spacing.lg`, `paddingVertical: 12`, divider `border.subtle`.

---

### 2.6 Chat bubbles

- **User**: Bg `chat.userBubble`, text `chat.userBubbleText`, `typography.body`, padding horizontal 16 vertical 12, radius `radius.lg`. Max width ~85%; align end.
- **AI**: Bg `chat.aiBubble`, text `chat.aiBubbleText`, same typography and padding, radius `radius.lg`. Max width ~85%; align start.
- **Result card (in thread)**: Bg `chat.resultCardBg`, border `border.subtle`, radius `radius.xl`, padding `spacing.md`. Visually one block (노션-style) inside the thread; not a bubble tail.

---

### 2.7 Calendar event blocks

- **Structure**: Block per event on grid/timeline; shows title (and optional time/location).
- **Visual**: Bg activity color or default `brand.primaryMuted` + `brand.primary` left border 4px; radius `radius.md`; padding vertical 8–10, horizontal 10–12; `typography.small`; min height 32px so two lines don’t overlap.
- **Interaction**: Press → open detail/edit. No nested cards inside the block.

---

### 2.8 Tabs (bottom)

- **Bar**: Bg `surface.card`, top border `border.subtle`, height 56 + safe area.
- **Item**: Icon + label; active `brand.primary`, inactive `text.tertiary`; `typography.caption` for label.
- **Touch**: 44pt minimum per item.

---

## 3. Per-screen direction (v2)

**Schedule**  
Full-screen chat: message list (user/AI bubbles + inline result card) fills the content area; no sidebar. Sticky bottom input bar (single-line input + send, 52px height) with KeyboardAvoidingView. Header: Mendly + menu; optional "• Online" in a thin status strip below header or inside first AI message. Result card: one elevated card (schedule summary + progress + CTA) embedded in the thread. No floating panels; all actions (e.g. "캘린더에 등록") inside the result card or follow-up bubbles.

**Inbox**  
Single block at top: one-line quick input + primary "Auto-Schedule" button (and optional + for more). Below: one-line result sentence ("N Recurring Events Created") then a grid/list of event chips (rounded, `radius.sm`). No multi-line memo list as the main focus; quick capture and outcome first. Empty state: short copy + CTA "첫 메모 추가하기" or "한 줄 입력 후 Auto-Schedule".

**Calendar**  
Timeline or week grid as the main content; each event is a block (see §2.7). Header: title + today + optional view toggle. Add event: FAB or header action → modal/sheet with one card (title, date/time, repeat) and primary submit. No list-first layout; calendar view is primary. Empty: "이번 주 일정이 없어요" + CTA to add or go to Schedule.

**Notes**  
List: note rows (title + optional snippet + date), each row = card or list row (§2.5). Detail: block-based — title block (title + meta), then body/checklist/code blocks with clear separation (bg + radius + padding). No long flat text; every logical block has a container (노션-style). Empty: "첫 노트를 작성해 보세요" + CTA.

**Review**  
One screen: caption "WEEKLY REPORT" (`typography.caption`) → title (`typography.title`) → metrics in a 2-column card grid → one "목표 vs 실제" card with row blocks (icon + name + value + progress bar). Bottom: optional banner (New Routine or CTA). No tabs inside Review; single scroll. Numbers use `typography.metric`; progress bars use semantic colors (success/warning/error).

**Profile**  
Sections as cards (§2.2): Account, Preferences, Subscription, Support, Sign out. Each section = card with list rows inside; destructive action (Sign out) uses secondary or danger style. Header: title "설정" or "Profile". No dashboard widgets; settings-only, clear hierarchy.

---

## 4. Implementation checklist

**Screen migration order** (Phase 6): Apply v2 structure and tokens in this order so each tab is testable and shippable: **Schedule → Inbox → Calendar → Notes → Review → Profile**.

- [x] **design-system.ts**: Replace/add colors (brand, surface, text, semantic, chat, border) with v2 hex values; add typography scale and line heights; set spacing and radius tokens.
- [x] **layoutConstants.ts**: Define `LAYOUT.screenBg`, `LAYOUT.header`, `LAYOUT.card`, `LAYOUT.input`, `LAYOUT.contentContainer`, `containerPadding` using v2 tokens (and `DARK_BG_COLOR`/`LIGHT_BG_COLOR` → `surface.screen` light/dark). Keep `CONTENT_MAX_WIDTH = 672`.
- [x] **ThemeContext**: Ensure theme drives `surface.screen`, `surface.card`, and all semantic tokens (no hardcoded hex in screens).
- [ ] **Components**: Update `ChatBubble`, `ResultCard`, `EmptyState`, buttons, inputs, and list rows to use design-system v2 tokens and new radius/spacing.
- [x] **Screens**: Apply per-screen direction (§3) — structure first (full-screen chat, single-block Inbox, calendar-first Calendar, block-based Notes, single-scroll Review, card sections Profile), then swap in v2 colors and typography.
- [x] **Tab bar**: Use `surface.card`, `border.subtle`, active `brand.primary`, inactive `text.tertiary`.
- [ ] **Accessibility**: 44/48pt touch targets, contrast (WCAG AA) for `text.primary`/`text.secondary` on their backgrounds, and labels for icon-only buttons.

This document is the single source of truth for the v2 overhaul; implement in order: design-system → layoutConstants → shared components → screens.
