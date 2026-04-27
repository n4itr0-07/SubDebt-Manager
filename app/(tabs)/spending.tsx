import { useTheme } from '../../hooks/useTheme';
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpendingEntryCard } from '../../components/SpendingEntryCard';
import { WeeklySpendingChart } from '../../components/WeeklySpendingChart';
import { CategoryBreakdown } from '../../components/CategoryBreakdown';
import { EmptyState } from '../../components/EmptyState';
import { SwipeableRow } from '../../components/SwipeableRow';
import { AmbientBackground } from '../../components/AmbientBackground';
import { AppPopup } from '../../components/AppPopup';
import { SearchBar } from '../../components/SearchBar';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useDailySpending, SpendingEntry } from '../../hooks/useDailySpending';
import { useCurrency } from '../../hooks/useCurrency';
import { formatCurrency } from '../../utils/dateHelpers';

type ViewMode = 'overview' | 'entries';

export default function SpendingScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const router = useRouter();
  const {
    entries,
    isLoaded,
    deleteEntry,
    getTotalForDay,
    getTotalForWeek,
    getTotalForMonth,
    getDailyAverage,
    getWeeklyData,
    getCategoryTotals,
    refresh,
  } = useDailySpending();
  const { currencyCode } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  const todayTotal = getTotalForDay(new Date());
  const weekTotal = getTotalForWeek();
  const monthTotal = getTotalForMonth(new Date());
  const dailyAvg = getDailyAverage();
  const weeklyData = getWeeklyData();
  const categoryTotals = getCategoryTotals();

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q) ||
        (entry.notes && entry.notes.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/modals/add-spending');
  };

  const handleEdit = (entry: SpendingEntry) => {
    router.push({ pathname: '/modals/edit-spending', params: { id: entry.id } });
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteEntry(deleteId);
      setDeleteId(null);
    }
  };

  const renderItem = ({ item }: { item: SpendingEntry }) => (
    <SwipeableRow
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item.id)}
    >
      <SpendingEntryCard
        entry={item}
        onPress={() => handleEdit(item)}
        onDelete={() => handleDelete(item.id)}
      />
    </SwipeableRow>
  );

  const renderOverviewHeader = () => (
    <>
      {/* Stats Grid: 2×2 */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statLabel}>SPENT TODAY</Text>
          <Text style={[styles.statValue, { color: colors.accent.purple }]}>
            {formatCurrency(todayTotal, currencyCode)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>THIS WEEK</Text>
          <Text style={styles.statValue}>
            {formatCurrency(weekTotal, currencyCode)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>THIS MONTH</Text>
          <Text style={styles.statValue}>
            {formatCurrency(monthTotal, currencyCode)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>DAILY AVG</Text>
          <Text style={[styles.statValue, { color: colors.accent.amber }]}>
            {formatCurrency(dailyAvg, currencyCode)}
          </Text>
        </View>
      </View>

      {/* Weekly Chart */}
      <WeeklySpendingChart
        data={weeklyData}
        currencyCode={currencyCode}
        weekTotal={weekTotal}
      />

      {/* Category Breakdown */}
      <CategoryBreakdown
        categories={categoryTotals}
        currencyCode={currencyCode}
      />

      {/* Section header for entries */}
      {entries.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          <Text style={styles.sectionCount}>{entries.length} total</Text>
        </View>
      )}
    </>
  );

  const renderEntriesHeader = () => (
    <>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search spending..."
        accentColor={colors.accent.purple}
      />
    </>
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <AmbientBackground />
        <View style={styles.header}>
          <Text style={styles.title}>Daily Spending</Text>
          <View style={styles.addButton}>
            <Ionicons name="add" size={22} color={colors.accent.purple} />
          </View>
        </View>
        <SkeletonLoader variant="debts" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AmbientBackground />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daily Spending</Text>
        <View style={styles.headerRight}>
          {/* View mode toggle */}
          <View style={styles.toggleWrap}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                viewMode === 'overview' && styles.toggleBtnActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setViewMode('overview');
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="stats-chart"
                size={16}
                color={
                  viewMode === 'overview'
                    ? colors.accent.purple
                    : colors.text.muted
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                viewMode === 'entries' && styles.toggleBtnActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setViewMode('entries');
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="list"
                size={16}
                color={
                  viewMode === 'entries'
                    ? colors.accent.purple
                    : colors.text.muted
                }
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Ionicons name="add" size={22} color={colors.accent.purple} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/modals/settings')}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={viewMode === 'entries' ? filteredEntries : filteredEntries.slice(0, 10)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          viewMode === 'overview' ? renderOverviewHeader : renderEntriesHeader
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.purple}
            colors={[colors.accent.purple]}
            progressBackgroundColor={colors.background.primary}
          />
        }
        ListEmptyComponent={
          !searchQuery ? (
            <View style={{ paddingVertical: 60 }}>
              <EmptyState
                icon="receipt-outline"
                title="No spending recorded"
                subtitle="Track your daily expenses to build your streak and understand your spending habits"
                actionLabel="Add Spending"
                onAction={handleAddPress}
                variant="debts"
              />
            </View>
          ) : (
            <View style={styles.noResultsWrap}>
              <Ionicons
                name="search-outline"
                size={36}
                color={colors.text.muted}
              />
              <Text style={styles.noResultsText}>
                No results for "{searchQuery}"
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          viewMode === 'overview' && entries.length > 10 ? (
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setViewMode('entries');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>
                View All {entries.length} Entries
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.accent.purple}
              />
            </TouchableOpacity>
          ) : null
        }
      />

      <AppPopup
        visible={!!deleteId}
        title="Delete Spending"
        message="Are you sure you want to permanently delete this spending entry?"
        icon="trash-outline"
        iconColor={colors.accent.red}
        cancelText="Cancel"
        confirmText="Delete"
        isDestructive={true}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title: {
      color: colors.text.primary,
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    toggleWrap: {
      flexDirection: 'row',
      backgroundColor: colors.glass.card,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: colors.glass.cardBorder,
      padding: 3,
    },
    toggleBtn: {
      width: 32,
      height: 28,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleBtnActive: {
      backgroundColor: isDark
        ? 'rgba(124,58,237,0.15)'
        : 'rgba(124,58,237,0.1)',
    },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark
        ? 'rgba(124,58,237,0.12)'
        : 'rgba(124,58,237,0.1)',
      borderWidth: 0.5,
      borderColor: isDark
        ? 'rgba(124,58,237,0.3)'
        : 'rgba(124,58,237,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.glass.card,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Stats Grid
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingHorizontal: 20,
      marginTop: 8,
      marginBottom: 14,
    },
    statCard: {
      flexBasis: '47%',
      flexGrow: 1,
      minHeight: 80,
      borderRadius: 18,
      padding: 14,
      backgroundColor: colors.glass.card,
      borderWidth: 0.5,
      borderColor: colors.glass.cardBorder,
      justifyContent: 'space-between',
    },
    statCardPrimary: {
      borderColor: isDark
        ? 'rgba(124,58,237,0.35)'
        : 'rgba(124,58,237,0.25)',
    },
    statLabel: {
      color: colors.text.tertiary,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 6,
    },
    statValue: {
      color: colors.text.primary,
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: -0.5,
    },

    // Section header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 6,
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.text.secondary,
      fontSize: 15,
      fontWeight: '700',
    },
    sectionCount: {
      color: colors.text.muted,
      fontSize: 12,
      fontWeight: '500',
    },

    // List
    listContent: {
      paddingTop: 4,
      paddingBottom: 120,
    },
    noResultsWrap: {
      alignItems: 'center',
      paddingTop: 40,
      gap: 12,
    },
    noResultsText: {
      color: colors.text.muted,
      fontSize: 15,
    },

    // View all
    viewAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginHorizontal: 20,
      marginTop: 4,
      marginBottom: 8,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: isDark
        ? 'rgba(124,58,237,0.08)'
        : 'rgba(124,58,237,0.06)',
      borderWidth: 0.5,
      borderColor: isDark
        ? 'rgba(124,58,237,0.2)'
        : 'rgba(124,58,237,0.15)',
    },
    viewAllText: {
      color: colors.accent.purple,
      fontSize: 14,
      fontWeight: '600',
    },
  });
