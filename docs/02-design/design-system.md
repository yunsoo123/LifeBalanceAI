# Mendly - Design System Documentation

**Date**: 2025-02-13  
**Version**: 1.0  
**Project**: Mendly  
**Status**: Phase 2 Complete

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Tokens](#2-design-tokens)
3. [UI Components](#3-ui-components)
4. [Screen Layouts](#4-screen-layouts)
5. [Usage Guidelines](#5-usage-guidelines)
6. [Best Practices](#6-best-practices)
7. [Accessibility](#7-accessibility)
8. [Dark Mode](#8-dark-mode)
9. [Examples & Recipes](#9-examples--recipes)
10. [Maintenance & Updates](#10-maintenance--updates)
11. [Resources](#11-resources)

---

## 1. Overview

### Philosophy

Mendly's design system embodies our brand values:

- **Gentle**: Soft colors, rounded corners, no harsh edges
- **Clear**: High contrast, readable text, obvious actions
- **Compassionate**: Forgiving UI, undo actions, no blame language
- **Consistent**: Same patterns everywhere, muscle memory

### Brand Personality

- **Helpful** (not bossy)
- **Gentle** (not strict)
- **Restorative** (not judgmental)

Think: A kind friend helping you plan, not a drill sergeant.

---

## 2. Design Tokens

All design tokens are defined in `lib/design-system.ts`.

### 2.1 Colors

#### Brand Colors

```typescript
colors.brand.primary      // #6366F1 (Indigo-500) - Primary actions
colors.brand.primaryDark  // #4F46E5 (Indigo-600) - Hover states
colors.brand.secondary    // #EC4899 (Pink-500)   - Accents
```

**Usage:**

- **Primary**: Main CTAs (buttons, links, active states)
- **Secondary**: Highlights, badges, special features

#### Semantic Colors

```typescript
colors.success   // Green - Completed, approved
colors.warning   // Amber - Caution, over-committed
colors.error     // Red - Errors, destructive actions
colors.info      // Blue - Informational messages
```

#### Neutral Palette

```typescript
colors.gray[50]   // Lightest - Backgrounds
colors.gray[100]  // Very light - Hover backgrounds
colors.gray[200]  // Light - Borders
colors.gray[400]  // Medium - Placeholder text
colors.gray[600]  // Dark - Secondary text
colors.gray[900]  // Darkest - Primary text (light mode)
colors.gray[950]  // Ultra dark - Backgrounds (dark mode)
```

#### Utility Classes (Use These in JSX)

```tsx
// Text colors
className="text-gray-900 dark:text-gray-100"  // Primary text
className="text-gray-600 dark:text-gray-400"  // Secondary text
className="text-gray-500 dark:text-gray-500"  // Tertiary text

// Background colors
className="bg-white dark:bg-gray-950"          // Primary background
className="bg-gray-50 dark:bg-gray-900"        // Secondary background
className="bg-gray-100 dark:bg-gray-800"       // Tertiary background

// Border colors
className="border-gray-200 dark:border-gray-800"  // Default borders
```

### 2.2 Typography

#### Font Family

```typescript
typography.fontFamily.body  // Inter (body text, headings)
typography.fontFamily.code  // JetBrains Mono (code blocks)
```

#### Font Sizes

| Class     | Size  | Use case                    |
|----------|-------|-----------------------------|
| `text-xs`   | 12px | Small labels, captions      |
| `text-sm`   | 14px | Secondary text, button text |
| `text-base` | 16px | Body text (default)         |
| `text-lg`   | 18px | Emphasized text             |
| `text-xl`   | 20px | Small headings (h4)         |
| `text-2xl`  | 24px | Medium headings (h3)        |
| `text-3xl`  | 30px | Large headings (h2, h1)      |

#### Font Weights

```tsx
font-normal    // 400 - Body text
font-medium    // 500 - Emphasized text
font-semibold  // 600 - Headings, buttons
font-bold      // 700 - Hero text, very important
```

**Usage guidelines:**

- Body text: `text-base font-normal`
- Buttons: `text-base font-semibold`
- Headings: `text-2xl font-bold`
- Captions: `text-sm text-gray-600`

### 2.3 Spacing

```typescript
spacing.xs   // 4px  - Tight spacing (icon-text gap)
spacing.sm   // 8px  - Small gap (list items)
spacing.md   // 16px - Default gap (card padding)
spacing.lg   // 24px - Large gap (section spacing)
spacing.xl   // 32px - Extra large (screen padding)
```

**Tailwind classes:**

```tsx
p-3    // padding: 12px
p-4    // padding: 16px (most common)
px-4   // horizontal padding: 16px
py-3   // vertical padding: 12px
gap-3  // flex gap: 12px
mb-4   // margin-bottom: 16px
```

### 2.4 Border Radius

```tsx
rounded-sm   // 4px   - Small elements (badges)
rounded-md   // 8px   - Default (buttons, inputs, cards)
rounded-lg   // 12px  - Large elements (modals)
rounded-full // 9999px - Circular (avatars, pills)
```

### 2.5 Shadows

```tsx
shadow-sm   // Subtle - Hoverable elements
shadow-md   // Default - Cards, dropdowns
shadow-lg   // Strong - Modals, popovers
shadow-xl   // Very strong - Major overlays
```

---

## 3. UI Components

All components are in `components/ui/`. Import from the barrel:

```tsx
import { Button, Card, Input } from '@/components/ui';
```

### 3.1 Button

**Variants:**

```tsx
<Button variant="primary">Save</Button>      // Blue, white text
<Button variant="secondary">Cancel</Button>   // Pink, white text
<Button variant="ghost">Edit</Button>         // Transparent, brand text
<Button variant="danger">Delete</Button>      // Red, white text
```

**Sizes:**

```tsx
<Button size="sm">Small</Button>   // 36px height
<Button size="md">Medium</Button>   // 44px height (default)
<Button size="lg">Large</Button>   // 52px height
```

**States:**

```tsx
<Button loading>Saving...</Button>     // Shows spinner
<Button disabled>Unavailable</Button>  // 50% opacity, not clickable
<Button fullWidth>Submit</Button>      // Takes full container width
```

**Best practices:**

- Primary for main action (one per screen)
- Ghost for secondary actions (edit, cancel)
- Danger for destructive actions (delete, sign out)
- Always ≥44dp height (mobile touch target)

### 3.2 Card

**Variants:**

```tsx
<Card variant="default">...</Card>   // White bg, gray border
<Card variant="elevated">...</Card>  // White bg, shadow
<Card variant="outlined">...</Card>  // Transparent, thick border
```

**Padding:**

```tsx
<Card padding="none">...</Card>  // No padding (for images)
<Card padding="sm">...</Card>    // 12px padding
<Card padding="md">...</Card>    // 16px padding (default)
<Card padding="lg">...</Card>    // 24px padding
```

**Composition:**

```tsx
<Card>
  <CardHeader>
    <Text className="text-xl font-bold">Title</Text>
  </CardHeader>
  <CardBody>
    <Text>Content goes here...</Text>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### 3.3 Input

**Basic:**

```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
/>
```

**With error:**

```tsx
<Input
  label="Password"
  error="Password must be at least 8 characters"
  value={password}
/>
```

**With helper text:**

```tsx
<Input
  label="Username"
  helperText="Choose a unique username"
  value={username}
/>
```

### 3.4 Badge

**Variants:**

```tsx
<Badge variant="default">Draft</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Over-committed</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">Pro</Badge>
```

**Sizes:**

```tsx
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### 3.5 Avatar

**With image:**

```tsx
<Avatar source={{ uri: 'https://...' }} size="md" />
```

**Fallback (initials):**

```tsx
<Avatar fallback="JD" size="lg" />  // Shows "JD"
<Avatar fallback="?" size="sm" />    // Shows "?"
```

### 3.6 Spinner

```tsx
<Spinner size="sm" />
<Spinner size="md" text="Loading..." />
<Spinner size="lg" fullScreen />  // Full-screen overlay
```

### 3.7 Skeleton

**Basic:**

```tsx
<Skeleton variant="text" width="100%" height={16} />
<Skeleton variant="circle" width={40} height={40} />
<Skeleton variant="rect" width="100%" height={200} />
```

**Presets:**

```tsx
<SkeletonText lines={3} />  // 3 lines of text
<SkeletonCard />            // Avatar + text placeholder
```

### 3.8 EmptyState

```tsx
<EmptyState
  icon={<CalendarIcon />}
  title="No schedules yet"
  description="Create your first AI schedule to get started"
  action={{
    label: "Create Schedule",
    onPress: () => navigation.navigate('Create')
  }}
/>
```

### 3.9 Toast (with useToast hook)

```tsx
function MyComponent() {
  const { toast, showSuccess, showError, dismissToast } = useToast();

  return (
    <>
      <Button onPress={() => showSuccess("Schedule saved!")}>
        Save
      </Button>

      <Toast
        visible={toast.visible}
        variant={toast.variant}
        message={toast.message}
        description={toast.description}
        onDismiss={dismissToast}
      />
    </>
  );
}
```

**Convenience methods:** `showSuccess`, `showError`, `showWarning`, `showInfo`.

### 3.10 ErrorBoundary

```tsx
<ErrorBoundary onError={(error) => console.error(error)}>
  <MyFeatureComponent />
</ErrorBoundary>
```

---

## 4. Screen Layouts

### 4.1 Common Layout Pattern

```tsx
<ScrollView className="flex-1 bg-white dark:bg-gray-950">
  <View className="p-4">
    {/* Header */}
    <View className="mb-6">
      <Text className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Screen Title
      </Text>
      <Text className="text-base text-gray-600 dark:text-gray-400">
        Subtitle or description
      </Text>
    </View>

    {/* Content */}
    <Card variant="default" padding="md">
      {/* ... */}
    </Card>

    {/* Actions */}
    <Button variant="primary" size="lg" fullWidth className="mt-6">
      Primary Action
    </Button>
  </View>
</ScrollView>
```

### 4.2 Spacing Guidelines

| Context         | Class | Value   |
|----------------|-------|---------|
| Screen padding | `p-4` | 16px    |
| Section spacing| `mb-6`| 24px    |
| Card spacing   | `mb-3`| 12px    |
| Button groups  | `gap-3` | 12px  |

### 4.3 Mobile-First Responsive

```tsx
// Mobile-first: base styles
<View className="px-4">
  {/* Mobile: 16px padding */}
</View>

// Tablet+: md: prefix
<View className="px-4 md:px-6">
  {/* Mobile: 16px, Tablet: 24px */}
</View>

// Desktop: lg: prefix
<View className="px-4 md:px-6 lg:px-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</View>
```

---

## 5. Usage Guidelines

### 5.1 When to Use Each Component

| Use case           | Component     | Example              |
|--------------------|---------------|----------------------|
| Call-to-action     | Button (primary) | "Create Schedule"  |
| Secondary action   | Button (ghost)   | "Edit", "Cancel"   |
| Destructive action | Button (danger)  | "Delete", "Sign Out" |
| Content container  | Card            | Schedule details     |
| Text input         | Input           | Email, password      |
| Status indicator   | Badge           | "Active", "Completed" |
| User identity      | Avatar          | Profile, initials    |
| Loading content    | Spinner, Skeleton | API calls         |
| No data            | EmptyState      | Empty list           |
| User feedback      | Toast           | "Saved!", "Error"    |
| Prevent crashes    | ErrorBoundary   | Wrap risky components |

### 5.2 Component Combinations

**Form layout:**

```tsx
<Card variant="default" padding="lg">
  <Input label="Email" placeholder="you@example.com" />
  <Input label="Password" placeholder="••••••••" secureTextEntry />
  <Button variant="primary" size="lg" fullWidth className="mt-4">
    Sign In
  </Button>
</Card>
```

**List item:**

```tsx
<Card variant="default" padding="md" className="mb-3">
  <View className="flex-row items-center justify-between">
    <View className="flex-row items-center gap-3">
      <Avatar fallback="AB" size="md" />
      <View>
        <Text className="text-base font-semibold">Title</Text>
        <Text className="text-sm text-gray-600">Subtitle</Text>
      </View>
    </View>
    <Badge variant="success">Active</Badge>
  </View>
</Card>
```

**Loading state:**

```tsx
{loading ? (
  <SkeletonCard />
) : (
  <Card>
    {/* Actual content */}
  </Card>
)}
```

---

## 6. Best Practices

### 6.1 DO's ✅

- Use design tokens for all colors, spacing, typography
- Import components from `@/components/ui/` (do not copy-paste)
- Support dark mode with `dark:` prefix on all colors
- Touch targets ≥44dp for all interactive elements
- Show loading states for all async actions
- Provide empty states for all lists/collections
- Handle errors gracefully with retry actions
- Use semantic roles (`accessibilityRole`)
- Add labels for screen readers (`accessibilityLabel`)
- Keep UI text friendly (e.g. "Let's create your schedule" not "Create schedule")

### 6.2 DON'Ts ❌

- ❌ Hardcode colors (use `colors.brand.primary`, not `#6366F1`)
- ❌ Inline styles (use Tailwind classes)
- ❌ Forget dark mode (test every screen in both modes)
- ❌ Tiny buttons (&lt;44dp height on mobile)
- ❌ Generic error messages ("Error" → "Failed to save schedule. Try again?")
- ❌ No loading states (blank screen = confused user)
- ❌ Blame language ("You failed to..." → "Let's try again")
- ❌ Nested ternaries &gt;2 levels (extract to a function)

### 6.3 Copy Tone Guidelines

Mendly is compassionate and restorative, not strict or judgmental.

**Good examples:**

- "Let's create your first schedule 🌱"
- "You completed 80% of your goals this week—nice work!"
- "This schedule might be too packed. Want to adjust?"
- "Oops, something went wrong. Let's try that again."

**Bad examples:**

- "Create schedule" (too cold)
- "You only completed 80%" (judgmental)
- "Error: Schedule exceeds 168 hours" (robotic)
- "Failed" (blame language)

**Emojis:** Use sparingly (✨ 🌱 🎉 💡) to add warmth, not excessively.

---

## 7. Accessibility

### 7.1 Color Contrast

All text must meet WCAG AA (4.5:1 contrast ratio).

- ✅ `text-gray-900` on `bg-white` (21:1)
- ✅ `text-gray-100` on `bg-gray-950` (18.5:1)
- ✅ `text-gray-600` on `bg-white` (7.2:1)
- ✅ White text on `bg-brand-primary` (6.8:1)

### 7.2 Touch Targets

All interactive elements must be ≥44×44dp (iOS) or ≥48×48dp (Android).

```tsx
// Good: Button enforces min-h-[44px]
<Button>Tap me</Button>

// Bad: Custom touchable without minimum size
<Pressable className="p-1">
  <Text>Tap</Text>
</Pressable>

// Fix: Add minimum size
<Pressable className="p-3 min-h-[44px] min-w-[44px]">
  <Text>Tap</Text>
</Pressable>
```

### 7.3 Screen Reader Labels

```tsx
<Button accessibilityLabel="Create new schedule">
  + New
</Button>

<Input
  label="Email"
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email to sign in"
/>

<Pressable
  accessibilityRole="button"
  accessibilityLabel="Delete schedule"
  onPress={handleDelete}
>
  <TrashIcon />
</Pressable>
```

### 7.4 Focus States

Global CSS provides visible focus rings:

```css
*:focus-visible {
  @apply outline-none ring-2 ring-brand-primary ring-offset-2;
}
```

---

## 8. Dark Mode

### 8.1 Implementation

Use Tailwind's `dark:` prefix for all surfaces and text:

```tsx
<View className="bg-white dark:bg-gray-950">
  <Text className="text-gray-900 dark:text-gray-100">
    This text adapts to dark mode
  </Text>
</View>
```

### 8.2 Color Palette (Dark Mode)

| Element        | Light mode   | Dark mode     |
|----------------|-------------|---------------|
| Primary BG     | `bg-white`  | `bg-gray-950` |
| Secondary BG   | `bg-gray-50`| `bg-gray-900` |
| Tertiary BG    | `bg-gray-100` | `bg-gray-800` |
| Primary text   | `text-gray-900` | `text-gray-100` |
| Secondary text | `text-gray-600` | `text-gray-400` |
| Borders        | `border-gray-200` | `border-gray-800` |

### 8.3 Testing Dark Mode

- **iOS Simulator:** Settings → Developer → Dark Appearance → ON
- **Android Emulator:** Settings → Display → Dark theme → ON
- **Expo Go:** Device settings → Display → Dark mode

**Checklist:**

- All screens readable in dark mode
- No white flashes during transitions
- Images/icons have appropriate contrast
- Shadows visible (consider lighter shadows in dark mode)

---

## 9. Examples & Recipes

### 9.1 Full Screen Layout

```tsx
export default function MyScreen() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Spinner fullScreen text="Loading..." />;
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-950">
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Screen
        </Text>
        <Card variant="elevated" padding="md">
          <Text className="text-base text-gray-900 dark:text-gray-100">
            Content
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}
```

### 9.2 Form with Validation

```tsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');
const { showSuccess, showError } = useToast();

const handleSubmit = async () => {
  if (!email.includes('@')) {
    setError('Please enter a valid email');
    return;
  }
  try {
    await submitForm(email);
    showSuccess('Form submitted!');
  } catch (err) {
    showError('Something went wrong. Please try again.');
  }
};

return (
  <Card variant="default" padding="lg">
    <Input
      label="Email"
      value={email}
      onChangeText={(text) => {
        setEmail(text);
        setError('');
      }}
      error={error}
      placeholder="you@example.com"
    />
    <Button variant="primary" size="lg" fullWidth onPress={handleSubmit} className="mt-4">
      Submit
    </Button>
  </Card>
);
```

### 9.3 List with Empty State

```tsx
const schedules = []; // Empty list

return (
  <View className="flex-1 bg-white dark:bg-gray-950 p-4">
    {schedules.length === 0 ? (
      <EmptyState
        title="No schedules yet"
        description="Create your first AI schedule to mend your week"
        action={{
          label: "Create Schedule",
          onPress: () => navigation.navigate('Create')
        }}
      />
    ) : (
      schedules.map((schedule) => (
        <Card key={schedule.id} variant="default" padding="md" className="mb-3">
          {/* Schedule content */}
        </Card>
      ))
    )}
  </View>
);
```

---

## 10. Maintenance & Updates

### 10.1 Adding New Components

1. Create in `components/ui/{ComponentName}.tsx`
2. Use design tokens from `lib/design-system.ts`
3. Support dark mode (`dark:` classes)
4. Add TypeScript props interface
5. Include JSDoc comments
6. Export from `components/ui/index.ts`
7. Add to this documentation

### 10.2 Updating Design Tokens

If brand colors or tokens change:

1. Update `lib/design-system.ts`
2. Update `tailwind.config.js`
3. Test all screens in light and dark mode
4. Update this doc with new values
5. Commit with clear rationale

### 10.3 Version History

| Version | Date       | Changes                    |
|---------|------------|----------------------------|
| 1.0     | 2025-02-13 | Initial design system (Phase 2) |

---

## 11. Resources

### Internal Files

- Design tokens: `lib/design-system.ts`
- UI components: `components/ui/*.tsx`
- Screen mockups: `app/(tabs)/*.tsx`
- Tailwind config: `tailwind.config.js`
- Global styles: `app/globals.css`

### External References

- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Native](https://reactnative.dev/docs)
- [NativeWind](https://www.nativewind.dev/)
- [Expo](https://docs.expo.dev/)
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

This document is the **single source of truth** for UI development in Mendly. All developers should reference it before creating new screens or components.

Questions or issues? Update this doc or open a discussion in the team channel.
