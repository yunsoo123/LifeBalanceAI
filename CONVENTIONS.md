# LifeBalance AI - Coding Conventions

**Last Updated**: 2025-02-13  
**Enforcement**: Via .cursorrules, ESLint, TypeScript, code reviews

---

## File & Folder Naming

### Files
- **Components**: `PascalCase.tsx` (e.g., `CalendarGrid.tsx`, `AIChat.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `format-date.ts`, `validate-input.ts`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-schedule.ts`, `use-auth.ts`)
- **Types**: `kebab-case.types.ts` (e.g., `schedule.types.ts`, `user.types.ts`)
- **Tests**: `{filename}.test.ts` or `{filename}.spec.ts`

### Folders
- **Feature folders**: `kebab-case/` (e.g., `ai-chat/`, `weekly-review/`)
- **Component folders**: Match component name in PascalCase if folder needed

---

## Code Structure

### Import Order
1. External libraries (React, React Native, third-party)
2. Internal absolute imports (`@/components`, `@/lib`)
3. Relative imports (`./ComponentName`, `../utils`)
4. Type imports (`import type { ... }`)
5. Styles (if any)

**Example:**
```typescript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/supabase/auth';
import { ScheduleCard } from './ScheduleCard';
import type { Schedule } from '@/types';
```

### Component Structure
1. Imports
2. Types/Interfaces (props, state)
3. Component function
4. Hooks (useState, useEffect, custom hooks)
5. Event handlers
6. Render logic
7. Exports

### Function Order in Files
1. Main exported function/component
2. Helper functions (non-exported)
3. Constants (if file-specific)

---

## TypeScript Standards

### Type Safety
- ✅ Use strict TypeScript (`strict: true` in tsconfig.json)
- ✅ Define explicit return types for all functions
- ✅ Use interfaces for objects with known shape
- ✅ Use types for unions, intersections, utility types
- ❌ NEVER use `any` (use `unknown` and narrow)
- ❌ NEVER use `@ts-ignore` (fix the root cause)

### Naming
- **Interfaces**: PascalCase, prefix `I` optional (e.g., `Schedule` or `ISchedule`)
- **Types**: PascalCase (e.g., `SubscriptionTier`)
- **Enums**: PascalCase for name, UPPER_SNAKE_CASE for values

```typescript
enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  TEAMS = 'TEAMS',
}
```

- **Generics**: Single uppercase letter or PascalCase (e.g., `T`, `TData`, `TResponse`)

### Props
- Define props interface above component
- Use destructuring in function parameters
- Provide default values via destructuring, not inside function

**Example:**
```typescript
interface CalendarGridProps {
  events: Event[];
  onEventPress: (eventId: string) => void;
  showWeekends?: boolean;
}

export function CalendarGrid({
  events,
  onEventPress,
  showWeekends = true,
}: CalendarGridProps) {
  // ...
}
```

---

## React/React Native Best Practices

### Component Patterns
- Use functional components (no class components)
- Use hooks (useState, useEffect, custom hooks)
- Memoize expensive computations with `useMemo`
- Memoize callbacks passed to children with `useCallback`
- Wrap expensive children with `React.memo` if they re-render unnecessarily

### State Management
- Use `useState` for local component state
- Use Context API for app-wide state (auth, theme)
- Avoid prop drilling >3 levels (use context or composition)

### Side Effects
- Use `useEffect` for side effects (data fetching, subscriptions)
- Always return cleanup function (unsubscribe, cancel, clear timers)
- List ALL dependencies in dependency array (or use ESLint rule)

### Keys in Lists
- Use stable, unique IDs (e.g., database ID)
- ❌ NEVER use array index as key (causes bugs on reorder/delete)

---

## Styling

### Approach
- Use NativeWind (Tailwind for React Native) or React Native StyleSheet
- Define design tokens in `lib/design-system.ts`
- ❌ Avoid inline styles (makes theming and consistency hard)

### Class Names (if using NativeWind)
- Use design system tokens: `bg-background-primary`, `text-text-secondary`
- Combine with dark mode: `dark:bg-gray-900`
- Keep className strings readable (<80 chars per line)

### StyleSheet (if using RN StyleSheet)
- Define styles at bottom of file
- Use design system constants

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    padding: spacing.md,
  },
});
```

---

## Comments & Documentation

### When to Comment
- Complex algorithms (explain WHY, not WHAT)
- Non-obvious workarounds (link to issue/PR)
- Public APIs (JSDoc for functions)

### JSDoc
- Use for exported functions, especially in `lib/`

```typescript
/**
 * Generates a realistic weekly schedule from user input.
 * @param userInput - Free-form text describing goals and constraints
 * @returns Schedule object with activities, feasibility, and suggestions
 * @throws Error if OpenAI API fails or response is invalid
 */
export async function generateSchedule(userInput: string): Promise<Schedule> {
  // ...
}
```

### TODO Comments
- Format: `// TODO(yourname): Description` or `// TODO: Description`
- Link to issue if applicable: `// TODO(#123): Fix edge case`

---

## Error Handling

### API Calls
- Wrap all API calls in try-catch
- Provide user-friendly error messages
- Log errors to Sentry (production) or console (dev)

```typescript
try {
  const schedule = await generateSchedule(input);
  return { success: true, data: schedule };
} catch (error) {
  console.error('Schedule generation failed:', error);
  Sentry.captureException(error);
  return { success: false, error: 'Failed to generate schedule. Please try again.' };
}
```

### React Error Boundaries
- Wrap risky components (especially third-party) in ErrorBoundary
- Provide fallback UI with retry action

### Validation
- Validate all user inputs with Zod before sending to API
- Validate all AI responses with Zod before using

```typescript
const ScheduleSchema = z.object({
  activities: z.array(z.object({ name: z.string(), hours: z.number() })),
  feasible: z.boolean(),
});

const result = ScheduleSchema.safeParse(aiResponse);
if (!result.success) {
  throw new Error('Invalid AI response');
}
```

---

## Database & Supabase

### Table Naming
- `snake_case`, plural (e.g., `users`, `schedules`, `weekly_reviews`)

### Column Naming
- `snake_case` (e.g., `user_id`, `created_at`, `subscription_tier`)

### Timestamps
- Always include `created_at` (timestamp with time zone)
- Include `updated_at` if data can be modified

### Foreign Keys
- Name as `{referenced_table_singular}_id` (e.g., `user_id`, `goal_id`)

### RLS Policies
- Enable RLS on ALL tables
- Default policy: users can only access their own data

```sql
CREATE POLICY "Users view own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Git Commit Messages

### Format
```
type(scope): Brief description
```

**Examples:**
- `feat(calendar): Add weekly view`
- `fix(ai): Handle OpenAI timeout errors`
- `docs(readme): Update installation steps`
- `refactor(auth): Simplify login flow`
- `test(schedule): Add unit tests for validation`
- `chore(deps): Update Expo to v52`

### Rules
- Use present tense ("Add feature" not "Added feature")
- Keep first line ≤72 characters
- Reference issues/PRs if applicable: `fix(#123): ...`

---

## Testing (Future)

### File Location
- Co-locate tests: `CalendarGrid.test.tsx` next to `CalendarGrid.tsx`
- Or use `__tests__/` folder

### Naming
- Test files: `{ComponentName}.test.tsx`
- Test suites: `describe('ComponentName', () => { ... })`
- Test cases: `it('should do something', () => { ... })`

---

## Environment Variables

### Naming
- **Public** (client-side): `EXPO_PUBLIC_{NAME}` (e.g., `EXPO_PUBLIC_SUPABASE_URL`)
- **Private** (server-side): No prefix (e.g., `OPENAI_API_KEY`)

### Storage
- Dev: `.env.local` (Git-ignored)
- Production: Vercel/Expo secrets

---

## Performance

### Optimization Rules
- Use `React.memo` for expensive pure components
- Use `useMemo` for expensive calculations
- Use `useCallback` for functions passed to memoized children
- Lazy load screens with React.lazy (web) or dynamic imports
- Optimize images: Use Next.js Image (web) or Expo Image (mobile)

### What NOT to Optimize
- Don't memoize everything (hurts readability, minimal gain)
- Don't optimize before measuring (premature optimization)

---

**Reference**: This document is referenced by `.cursorrules` and enforced via code reviews. Update it when the team agrees on new conventions.
