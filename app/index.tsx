import { useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View } from 'react-native';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const hasSeen = await storage.getString(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
        if (hasSeen === 'true') {
          setInitialRoute('/(tabs)/subscriptions');
        } else {
          setInitialRoute('/onboarding');
        }
      } catch {
        setInitialRoute('/onboarding');
      }
    }
    checkOnboarding();
  }, []);

  if (!initialRoute) return <View style={{ flex: 1, backgroundColor: colors.background.primary }} />;

  return <Redirect href={initialRoute as any} />;
}
