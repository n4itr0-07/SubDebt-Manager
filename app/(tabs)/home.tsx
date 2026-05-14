import { useTheme } from '../../hooks/useTheme';
import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { AmbientBackground } from '../../components/AmbientBackground';

import { useDebts } from '../../hooks/useDebts';
import { useCredits } from '../../hooks/useCredits';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useDailySpending } from '../../hooks/useDailySpending';
import { useCurrency } from '../../hooks/useCurrency';
import { formatCurrency } from '../../utils/dateHelpers';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const router = useRouter();
  const { currencyCode, convertAmount, refresh: refreshCurrency } = useCurrency();
  const [refreshing, setRefreshing] = React.useState(false);

  const { debts, getTotalPendingAmount: getDebtTotal, refresh: refreshDebts } = useDebts();
  const { credits, getTotalPendingAmount: getCreditTotal, refresh: refreshCredits } = useCredits();
  const { subscriptions, getTotalAmount: getSubTotal, refresh: refreshSubs } = useSubscriptions();
  const { getDailyAverage, getTotalForMonth, refresh: refreshSpending, entries } = useDailySpending();

  const loadData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshCurrency(),
      refreshDebts(),
      refreshCredits(),
      refreshSubs(),
      refreshSpending()
    ]);
    setRefreshing(false);
  }, [refreshCurrency, refreshDebts, refreshCredits, refreshSubs, refreshSpending]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalDebt = getDebtTotal(convertAmount);
  const totalCredit = getCreditTotal(convertAmount);
  const totalSubs = getSubTotal(convertAmount);
  const monthlySpending = getTotalForMonth(new Date(), convertAmount);
  const dailyAvg = getDailyAverage('30d', convertAmount);

  // Net Liability = (Debts + Subs + Expected Monthly Spending) - Credits
  const projectedLiability = totalDebt + totalSubs + (dailyAvg * 30) - totalCredit;

  return (
    <SafeAreaView style={styles.container}>
      <AmbientBackground />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Overview</Text>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.push('/modals/settings')}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.accent.blue} />
        }
      >
        {/* Net Liability Score */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>PROJECTED MONTHLY LIABILITY</Text>
          <Text style={[styles.heroAmount, projectedLiability < 0 && { color: colors.accent.green }]}>
            {formatCurrency(Math.abs(projectedLiability), currencyCode)}
          </Text>
          <Text style={styles.heroSub}>
            {projectedLiability > 0 ? 'You owe/spend more than you are owed' : 'You are owed more than your expected liabilities'}
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.grid}>
          <View style={[styles.gridItem, { borderColor: isDark ? 'rgba(239,83,80,0.3)' : 'rgba(239,83,80,0.2)' }]}>
            <Ionicons name="wallet-outline" size={20} color={colors.accent.red} />
            <Text style={styles.gridAmount}>{formatCurrency(totalDebt, currencyCode)}</Text>
            <Text style={styles.gridLabel}>Pending Debts</Text>
          </View>
          <View style={[styles.gridItem, { borderColor: isDark ? 'rgba(102,187,106,0.3)' : 'rgba(102,187,106,0.2)' }]}>
            <Ionicons name="cash-outline" size={20} color={colors.accent.green} />
            <Text style={styles.gridAmount}>{formatCurrency(totalCredit, currencyCode)}</Text>
            <Text style={styles.gridLabel}>Owed to You</Text>
          </View>
          <View style={[styles.gridItem, { borderColor: isDark ? 'rgba(79,195,247,0.3)' : 'rgba(79,195,247,0.2)' }]}>
            <Ionicons name="card-outline" size={20} color={colors.accent.blue} />
            <Text style={styles.gridAmount}>{formatCurrency(totalSubs, currencyCode)}</Text>
            <Text style={styles.gridLabel}>Monthly Subs</Text>
          </View>
          <View style={[styles.gridItem, { borderColor: isDark ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.2)' }]}>
            <Ionicons name="receipt-outline" size={20} color={colors.accent.purple} />
            <Text style={styles.gridAmount}>{formatCurrency(monthlySpending, currencyCode)}</Text>
            <Text style={styles.gridLabel}>Spent This Month</Text>
          </View>
        </View>

        {/* Recent Activity Summary */}
        <Text style={styles.sectionTitle}>APP HEALTH</Text>
        <View style={styles.healthCard}>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Active Subscriptions</Text>
            <Text style={styles.healthValue}>{subscriptions.filter(s => s.isActive).length}</Text>
          </View>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Unpaid Debts</Text>
            <Text style={styles.healthValue}>{debts.filter(d => !d.isPaid).length}</Text>
          </View>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Unreturned Credits</Text>
            <Text style={styles.healthValue}>{credits.filter(c => !c.isReturned).length}</Text>
          </View>
          <View style={[styles.healthRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.healthLabel}>Total Spending Entries</Text>
            <Text style={styles.healthValue}>{entries.length}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.glass.cardBorder,
  },
  title: { color: colors.text.primary, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  content: { padding: 20, paddingBottom: 120 },
  
  heroCard: {
    backgroundColor: colors.glass.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 0.5,
    borderColor: colors.glass.cardBorder,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroLabel: { color: colors.text.tertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  heroAmount: { color: colors.text.primary, fontSize: 36, fontWeight: '800', letterSpacing: -1, marginBottom: 4 },
  heroSub: { color: colors.text.muted, fontSize: 13, textAlign: 'center' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    width: '48%',
    backgroundColor: colors.glass.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  gridAmount: { color: colors.text.primary, fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  gridLabel: { color: colors.text.secondary, fontSize: 12, fontWeight: '500' },

  sectionTitle: { color: colors.text.primary, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  healthCard: {
    backgroundColor: colors.glass.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.glass.cardBorder,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  },
  healthLabel: { color: colors.text.secondary, fontSize: 14 },
  healthValue: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
});
