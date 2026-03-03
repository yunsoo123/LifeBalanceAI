import Constants from 'expo-constants';

/**
 * Base URL for API requests (schedule generate, note parse).
 * On device/emulator: set EXPO_PUBLIC_API_URL to your PC IP (e.g. http://192.168.0.5:8081).
 */
export function getApiBase(): string {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env && env.trim()) return env.trim().replace(/\/$/, '');

  // Web: use same origin so API routes work regardless of port
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as { location?: { origin: string } }).location?.origin
  ) {
    return (globalThis as { location: { origin: string } }).location.origin;
  }

  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.startsWith('http') ? hostUri : hostUri.replace(/^exp:\/\//, 'http://');
      return host;
    }
    const manifest = (Constants as { manifest?: { debuggerHost?: string } }).manifest;
    if (manifest?.debuggerHost) {
      return `http://${manifest.debuggerHost}`;
    }
  }

  return 'http://localhost:8081';
}

/** Shown when API fails with network error (e.g. on device without EXPO_PUBLIC_API_URL). */
export const API_SETUP_HINT =
  '실기기/에뮬레이터 사용 시: PC와 같은 Wi-Fi에서 .env에 EXPO_PUBLIC_API_URL=http://PC의IP:8081 추가 후 앱 재시작하세요. (PC IP는 터미널에 표시된 exp:// 주소에서 확인)';
