import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FloatingNavBar } from '../../components/FloatingNavBar';
import { QuickAddMenu } from '../../components/QuickAddMenu';
import { useTheme } from '../../hooks/useTheme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <Tabs
        initialRouteName="subscriptions"
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <FloatingNavBar 
            {...props} 
            isMenuOpen={isMenuOpen} 
            onAddPress={() => setIsMenuOpen(!isMenuOpen)} 
          />
        )}
      >
        <Tabs.Screen name="subscriptions" />
        <Tabs.Screen name="credits" />
        <Tabs.Screen name="debts" />
        <Tabs.Screen name="spending" />
      </Tabs>
      <QuickAddMenu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </GestureHandlerRootView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
