import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FloatingNavBar } from '../../components/FloatingNavBar';
import { useTheme } from '../../hooks/useTheme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <Tabs
        initialRouteName="subscriptions"
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <FloatingNavBar {...props} />}
      >
        <Tabs.Screen name="subscriptions" />
        <Tabs.Screen name="debts" />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
