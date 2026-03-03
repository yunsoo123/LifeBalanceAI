import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';

const STORAGE_KEY = '@mendly_theme';
type Theme = 'light' | 'dark';

type ThemeContextValue = { theme: Theme; setTheme: (t: Theme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Sync theme to NativeWind so dark: classes resolve. Call after any theme change. */
function syncNativeWind(theme: Theme) {
  try {
    colorScheme.set(theme);
  } catch {
    // NativeWind / css-interop may not be ready (e.g. SSR)
  }
}

/** 웹: html .dark 클래스 */
function applyThemeWeb(theme: Theme) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(system === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'dark' || v === 'light') {
        setThemeState(v);
        syncNativeWind(v);
        applyThemeWeb(v);
      }
    });
  }, []);

  useEffect(() => {
    syncNativeWind(theme);
    applyThemeWeb(theme);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEY, t);
    syncNativeWind(t);
    applyThemeWeb(t);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
