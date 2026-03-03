import { getStartOfWeek } from '@/lib/weekUtils';

describe('weekUtils', () => {
  describe('getStartOfWeek', () => {
    it('returns Monday for a Monday', () => {
      const monday = new Date('2025-02-10');
      expect(getStartOfWeek(monday)).toBe('2025-02-10');
    });
    it('returns previous Monday for Wednesday', () => {
      const wed = new Date('2025-02-12');
      expect(getStartOfWeek(wed)).toBe('2025-02-10');
    });
    it('returns previous Monday for Sunday', () => {
      const sun = new Date('2025-02-16');
      expect(getStartOfWeek(sun)).toBe('2025-02-10');
    });
    it('returns YYYY-MM-DD format', () => {
      const date = new Date('2025-02-14');
      const result = getStartOfWeek(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).toBe('2025-02-10');
    });
  });
});
