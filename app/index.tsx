import { useEffect, useState, useRef } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const hasResolved = useRef(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (hasResolved.current) return;
    hasResolved.current = true;

    storage.getString(STORAGE_KEYS.HAS_SEEN_ONBOARDING)
      .then(hasSeen => {
        setInitialRoute(hasSeen === 'true' ? '/(tabs)/home' : '/onboarding');
      })
      .catch(() => {
        setInitialRoute('/(tabs)/home');
      });
  }, []);

  if (!initialRoute) {
    return <View style={{ flex: 1, backgroundColor: colors.background.primary }} />;
  }

  return <Redirect href={initialRoute as any} />;
}
