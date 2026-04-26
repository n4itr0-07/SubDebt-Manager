import { useTheme } from '../../hooks/useTheme';
import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DebtCard } from '../../components/DebtCard';
import { EmptyState } from '../../components/EmptyState';
import { SwipeableRow } from '../../components/SwipeableRow';
import { AmbientBackground } from '../../components/AmbientBackground';
import { AppPopup } from '../../components/AppPopup';
import { SearchBar } from '../../components/SearchBar';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Confetti } from '../../components/Confetti';
import { useDebts, Debt } from '../../hooks/useDebts';
import { useCurrency } from '../../hooks/useCurrency';
import { formatCurrency } from '../../utils/dateHelpers';
import { typography, spacing } from '../../constants/typography';

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
];

export default function DebtsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const { debts, isLoaded, deleteDebt, markDebtAsPaid, getTotalPendingAmount, refresh } = useDebts();
  const { currencyCode } = useCurrency();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const filteredDebts = useMemo(() => {
    let result = debts;

    // Apply filter
    if (filter === 'pending') result = result.filter(d => !d.isPaid);
    else if (filter === 'paid') result = result.filter(d => d.isPaid);

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(d =>
        d.personName.toLowerCase().includes(q) ||
        (d.purpose && d.purpose.toLowerCase().includes(q)) ||
        (d.notes && d.notes.toLowerCase().includes(q)) ||
        (d.phoneNumber && d.phoneNumber.includes(q))
      );
    }

    return result;
  }, [debts, filter, searchQuery]);

  const totalPending = getTotalPendingAmount();

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
    router.push('/modals/add-debt');
  };

  const handleTogglePaid = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markDebtAsPaid(id);
    // Trigger confetti celebration
    setShowConfetti(true);
  };

  const handleEdit = (debt: Debt) => {
    router.push({
      pathname: '/modals/edit-debt',
      params: { id: debt.id },
    });
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteDebt(deleteId);
      setDeleteId(null);
    }
  };

  const renderItem = ({ item }: { item: Debt }) => (
    <SwipeableRow
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item.id)}
    >
      <DebtCard 
        debt={item} 
        onTogglePaid={handleTogglePaid}
        onPress={() => handleEdit(item)}
        onDelete={() => handleDelete(item.id)}
      />
    </SwipeableRow>
  );

  const renderHeader = () => (
    <>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryLabel}>Total Pending</Text>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>
              {debts.filter(d => !d.isPaid).length} pending
            </Text>
          </View>
        </View>
        <Text style={styles.summaryAmount}>
          {formatCurrency(totalPending, currencyCode)}
        </Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search debts..."
        accentColor={colors.accent.amber}
      />

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {filterOptions.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.filterPill, filter === opt.key && styles.filterPillActive]}
            onPress={() => setFilter(opt.key)}
          >
            <Text style={[styles.filterText, filter === opt.key && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  // Skeleton Loading
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <AmbientBackground />
        <View style={styles.header}>
          <Text style={styles.title}>Debts</Text>
          <View style={styles.headerRight}>
            <View style={styles.addButton}>
              <Ionicons name="add" size={22} color={colors.accent.amber} />
            </View>
            <View style={styles.iconButton}>
              <Ionicons name="settings-outline" size={22} color={colors.text.tertiary} />
            </View>
          </View>
        </View>
        <SkeletonLoader variant="debts" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AmbientBackground />
      
      {/* Confetti overlay */}
      <Confetti
        visible={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Debts</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Ionicons name="add" size={22} color={colors.accent.amber} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/modals/settings')}>
            <Ionicons name="settings-outline" size={22} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {filteredDebts.length === 0 && !searchQuery ? (
        <>
          {renderHeader()}
          <EmptyState
            icon="wallet-outline"
            title="No debts recorded"
            subtitle="Track money you owe to people"
            actionLabel="Add Debt"
            onAction={handleAddPress}
            variant="debts"
          />
        </>
      ) : (
        <FlatList
          data={filteredDebts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.amber}
              colors={[colors.accent.amber]}
              progressBackgroundColor="#1a1a2e"
            />
          }
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.noResultsWrap}>
                <Ionicons name="search-outline" size={36} color={colors.text.muted} />
                <Text style={styles.noResultsText}>No results for "{searchQuery}"</Text>
              </View>
            ) : null
          }
        />
      )}

      <AppPopup 
        visible={!!deleteId}
        title="Delete Debt"
        message="Are you sure you want to permanently delete this debt? This will clean it from storage."
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

const getStyles = (colors: any) => StyleSheet.create({
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
    gap: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,183,77,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,183,77,0.3)',
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
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.glass.card,
    borderWidth: 0.5,
    borderColor: colors.glass.cardBorder,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: colors.text.tertiary,
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255,183,77,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,183,77,0.3)',
  },
  pendingBadgeText: {
    color: '#FFB74D',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryAmount: {
    color: colors.text.primary,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.glass.card,
    borderWidth: 0.5,
    borderColor: colors.glass.buttonSecondary,
  },
  filterPillActive: {
    backgroundColor: 'rgba(255,183,77,0.15)',
    borderColor: 'rgba(255,183,77,0.4)',
  },
  filterText: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.accent.amber,
    fontWeight: '600',
  },
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
});
