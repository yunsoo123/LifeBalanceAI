/**
 * Unit tests for design system tokens
 */
import { colors, spacing, typography } from '@/lib/design-system';

describe('design-system', () => {
  describe('colors', () => {
    it('exposes brand primary', () => {
      expect(colors.brand.primary).toBe('#2563eb');
    });
    it('exposes semantic success', () => {
      expect(colors.success.DEFAULT).toBe('#10B981');
    });
    it('exposes gray scale', () => {
      expect(colors.gray[500]).toBe('#6B7280');
    });
  });

  describe('spacing', () => {
    it('has consistent scale', () => {
      expect(spacing.xs).toBeDefined();
      expect(spacing.md).toBeGreaterThan(spacing.xs);
    });
  });

  describe('typography', () => {
    it('has font sizes', () => {
      expect(typography.fontSize.xs).toBeDefined();
      expect(typography.fontSize.lg).toBeDefined();
    });
  });
});
