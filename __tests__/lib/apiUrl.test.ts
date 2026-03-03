/**
 * getApiBase is environment-dependent (Expo may inline env at build time).
 * We test that it returns a valid URL shape and that API_SETUP_HINT is defined.
 */
import { getApiBase, API_SETUP_HINT } from '@/lib/apiUrl';

describe('apiUrl', () => {
  describe('getApiBase', () => {
    it('returns a string starting with http', () => {
      const base = getApiBase();
      expect(typeof base).toBe('string');
      expect(base.startsWith('http://') || base.startsWith('https://')).toBe(true);
    });

    it('returns a string without trailing slash', () => {
      const base = getApiBase();
      expect(base.endsWith('/')).toBe(false);
    });
  });

  describe('API_SETUP_HINT', () => {
    it('is a non-empty string', () => {
      expect(typeof API_SETUP_HINT).toBe('string');
      expect(API_SETUP_HINT.length).toBeGreaterThan(0);
    });
  });
});
