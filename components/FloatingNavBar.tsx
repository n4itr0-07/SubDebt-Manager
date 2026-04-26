import { useTheme } from '../hooks/useTheme';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabConfig {
  key: string;
  name: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const tabs: TabConfig[] = [
  {
    key: 'subscriptions',
    name: 'subscriptions',
    label: 'Subscriptions',
    icon: 'card-outline',
    activeIcon: 'card',
  },
  {
    key: 'debts',
    name: 'debts',
    label: 'Debts',
    icon: 'wallet-outline',
    activeIcon: 'wallet',
  },
];

export const FloatingNavBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom > 0 ? insets.bottom + 14 : 32 }]}>
      <View style={styles.inner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabConfig = tabs.find(t => t.name === route.name);

          if (!tabConfig) return null;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tab, isFocused && styles.tabActive]}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isFocused ? tabConfig.activeIcon : tabConfig.icon) as any}
                size={21}
                color={isFocused ? colors.accent.blue : colors.text.placeholder}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {tabConfig.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.glass.nav,
    borderWidth: 1,
    borderColor: colors.glass.navBorder,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 22,
    gap: 6,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: colors.accent.blue + '1A',
  },
  label: {
    color: colors.text.placeholder,
    fontSize: 13,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.accent.blue,
    fontWeight: '600',
  },
});
