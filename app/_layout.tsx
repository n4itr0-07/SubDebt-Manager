import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Animated, Image } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { hydrateStorage } from '../storage/mmkv';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    async function prepare() {
      try {
        await hydrateStorage();
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch {
        // Ignore errors
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();

    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 300);
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        {/* Custom Logo */}
        <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Image source={require('../assets/icon.png')} style={styles.logoImage} />
        </Animated.View>

        {/* App Name */}
        <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
          <Text style={styles.appName}>SubDebt</Text>
          <Text style={styles.tagline}>Subscriptions & Debts Tracker</Text>
        </Animated.View>

        {/* Loader */}
        <ActivityIndicator 
          size="small" 
          color="rgba(79,195,247,0.5)" 
          style={styles.loader} 
        />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0c0c14' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modals/add-subscription" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="modals/edit-subscription" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="modals/add-debt" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="modals/edit-debt" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="modals/settings" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0c0c14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: 24,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  appName: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  loader: {
    position: 'absolute',
    bottom: 60,
  },
});
