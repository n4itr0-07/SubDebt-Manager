import { useTheme } from '../hooks/useTheme';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
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
    label: 'Subs',
    icon: 'card-outline',
    activeIcon: 'card',
  },
  {
    key: 'credits',
    name: 'credits',
    label: 'Lent',
    icon: 'cash-outline',
    activeIcon: 'cash',
  },
  {
    key: 'debts',
    name: 'debts',
    label: 'Debts',
    icon: 'wallet-outline',
    activeIcon: 'wallet',
  },
  {
    key: 'spending',
    name: 'spending',
    label: 'Spending',
    icon: 'receipt-outline',
    activeIcon: 'receipt',
  },
];

export interface CustomTabBarProps extends BottomTabBarProps {
  onAddPress?: () => void;
  isMenuOpen?: boolean;
}

export const FloatingNavBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation, onAddPress, isMenuOpen }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom > 0 ? insets.bottom + 10 : 24 }]}>
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

          const tabElement = (
            <TouchableOpacity
              key={route.key}
              style={[styles.tab, isFocused && styles.tabActive]}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isFocused ? tabConfig.activeIcon : tabConfig.icon) as any}
                size={20}
                color={isFocused ? colors.accent.blue : colors.text.placeholder}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {tabConfig.label}
              </Text>
            </TouchableOpacity>
          );

          if (index === 1) {
            return (
              <React.Fragment key={route.key}>
                {tabElement}
                <AddButton onPress={onAddPress} isMenuOpen={isMenuOpen} colors={colors} styles={styles} isDark={isDark} />
              </React.Fragment>
            );
          }
          return tabElement;
        })}
      </View>
    </View>
  );
};

const AddButton = ({ onPress, isMenuOpen, colors, styles, isDark }: any) => {
  const rotation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(rotation, {
      toValue: isMenuOpen ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 40,
    }).start();
  }, [isMenuOpen]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  return (
    <TouchableOpacity
      style={styles.addButtonWrapper}
      activeOpacity={0.8}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onPress) onPress();
      }}
    >
      <Animated.View style={[styles.addButton, { transform: [{ rotate: spin }] }]}>
        <Ionicons name="add" size={28} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 62,
    borderRadius: 31,
    backgroundColor: isDark
      ? 'rgba(18, 18, 28, 0.92)'
      : 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: isDark
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.08)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.5 : 0.15,
    shadowRadius: 16,
    ...Platform.select({
      android: {
        elevation: 24,
      },
    }),
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    gap: 3,
    marginHorizontal: 3,
  },
  tabActive: {
    backgroundColor: isDark
      ? 'rgba(79, 195, 247, 0.12)'
      : 'rgba(2, 132, 199, 0.1)',
  },
  label: {
    color: colors.text.placeholder,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.accent.blue,
    fontWeight: '700',
  },
  addButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginTop: -20, // pop up slightly
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: isDark ? '#12121c' : '#ffffff',
  },
});
