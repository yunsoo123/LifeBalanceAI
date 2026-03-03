import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOnboardingDone, setOnboardingDone } from '@/lib/onboardingStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

describe('onboardingStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOnboardingDone', () => {
    it('returns true when storage has "true"', async () => {
      mockGetItem.mockResolvedValue('true');
      await expect(getOnboardingDone()).resolves.toBe(true);
      expect(mockGetItem).toHaveBeenCalledWith('@mendly_onboarding_done');
    });

    it('returns false when storage has other value', async () => {
      mockGetItem.mockResolvedValue('false');
      await expect(getOnboardingDone()).resolves.toBe(false);
    });

    it('returns false when storage is null', async () => {
      mockGetItem.mockResolvedValue(null);
      await expect(getOnboardingDone()).resolves.toBe(false);
    });
  });

  describe('setOnboardingDone', () => {
    it('sets storage to "true"', async () => {
      mockSetItem.mockResolvedValue(undefined);
      await setOnboardingDone();
      expect(mockSetItem).toHaveBeenCalledWith('@mendly_onboarding_done', 'true');
    });
  });
});
