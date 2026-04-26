import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';
import { lightColors, darkColors, ThemeColors } from '../constants/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  isDark: true,
  colors: darkColors,
  setMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const savedMode = await storage.getString('app_theme');
        if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
          setModeState(savedMode as ThemeMode);
        } else {
          setModeState('dark'); // Default to dark as requested
        }
      } catch (e) {
        setModeState('dark');
      } finally {
        setIsReady(true);
      }
    }
    loadTheme();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await storage.set('app_theme', newMode);
  };

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const colors = isDark ? darkColors : lightColors;

  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
