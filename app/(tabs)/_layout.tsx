import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FloatingNavBar } from '../../components/FloatingNavBar';

export default function TabsLayout() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c14',
  },
});
