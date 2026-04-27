import { useTheme } from '../hooks/useTheme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/dateHelpers';

interface CategoryTotal {
  category: string;
  total: number;
}

interface CategoryBreakdownProps {
  categories: CategoryTotal[];
  currencyCode: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#EF5350',
  Travel: '#42A5F5',
  Shopping: '#AB47BC',
  Bills: '#FFA726',
  Health: '#26C6DA',
  Entertainment: '#66BB6A',
  Other: '#78909C',
};

const CATEGORY_ICONS: Record<string, string> = {
  Food: 'restaurant-outline',
  Travel: 'bus-outline',
  Shopping: 'bag-outline',
  Bills: 'receipt-outline',
  Health: 'medkit-outline',
  Entertainment: 'film-outline',
  Other: 'ellipsis-horizontal-outline',
};

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categories,
  currencyCode,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  if (categories.length === 0) return null;

  const maxTotal = Math.max(...categories.map((c) => c.total), 1);
  const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>CATEGORY BREAKDOWN</Text>

      {categories.slice(0, 7).map((cat, index) => {
        const color = CATEGORY_COLORS[cat.category] || '#78909C';
        const icon = CATEGORY_ICONS[cat.category] || 'ellipsis-horizontal-outline';
        const percentage = grandTotal > 0 ? Math.round((cat.total / grandTotal) * 100) : 0;
        const barWidth = Math.max((cat.total / maxTotal) * 100, 4);

        return (
          <View key={cat.category} style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: `${color}18`, borderColor: `${color}35` }]}>
              <Ionicons name={icon as any} size={16} color={color} />
            </View>
            <View style={styles.info}>
              <View style={styles.labelRow}>
                <Text style={styles.catName}>{cat.category}</Text>
                <Text style={styles.catAmount}>
                  {formatCurrency(cat.total, currencyCode)}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${barWidth}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.percentText}>{percentage}% of total</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      marginHorizontal: 20,
      marginBottom: 14,
      padding: 18,
      borderRadius: 22,
      backgroundColor: colors.glass.card,
      borderWidth: 0.5,
      borderColor: colors.glass.cardBorder,
    },
    title: {
      color: colors.text.tertiary,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.8,
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      marginTop: 2,
    },
    info: {
      flex: 1,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    catName: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    catAmount: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    barTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(0,0,0,0.05)',
      marginBottom: 4,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 3,
      opacity: 0.85,
    },
    percentText: {
      color: colors.text.muted,
      fontSize: 11,
      fontWeight: '500',
    },
  });
