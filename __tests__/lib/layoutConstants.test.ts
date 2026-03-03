/**
 * Layout constants used for consistent UI. Changes here affect all screens.
 */
import { LAYOUT, CONTENT_MAX_WIDTH } from '@/lib/layoutConstants';

describe('layoutConstants', () => {
  describe('LAYOUT', () => {
    it('defines screenBg', () => {
      expect(LAYOUT.screenBg).toMatch(/bg-(slate|gray)-50/);
      expect(LAYOUT.screenBg).toContain('dark:');
    });
    it('defines contentContainer with max-width', () => {
      expect(LAYOUT.contentContainer).toContain('max-w-content');
      expect(LAYOUT.contentContainer).toContain('mx-auto');
    });
    it('defines pageTitle with typography', () => {
      expect(LAYOUT.pageTitle).toMatch(/text-2xl|text-3xl/);
      expect(LAYOUT.pageTitle).toMatch(/font-bold|font-extrabold/);
    });
    it('defines sectionTitle', () => {
      expect(LAYOUT.sectionTitle).toMatch(/font-(bold|semibold)/);
    });
    it('defines textarea for multiline input', () => {
      expect(LAYOUT.textarea).toContain('rounded-2xl');
      expect(LAYOUT.textarea).toMatch(/min-h-\[1[46]0px\]/);
    });
  });

  describe('CONTENT_MAX_WIDTH', () => {
    it('is 672 for centered content', () => {
      expect(CONTENT_MAX_WIDTH).toBe(672);
    });
  });
});
