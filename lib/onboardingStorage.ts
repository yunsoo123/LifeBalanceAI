import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@mendly_onboarding_done';

export async function getOnboardingDone(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY);
  return v === 'true';
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEY, 'true');
}
