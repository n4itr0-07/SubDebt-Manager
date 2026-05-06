import { useTheme } from '../../hooks/useTheme';
import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscriptionCard } from '../../components/SubscriptionCard';
import { EmptyState } from '../../components/EmptyState';
import { SwipeableRow } from '../../components/SwipeableRow';
import { AmbientBackground } from '../../components/AmbientBackground';
import { AppPopup } from '../../components/AppPopup';
import { SearchBar } from '../../components/SearchBar';
import { SpendingChart } from '../../components/SpendingChart';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useSubscriptions, Subscription } from '../../hooks/useSubscriptions';
import { useCurrency } from '../../hooks/useCurrency';
import { formatCurrency } from '../../utils/dateHelpers';
import { typography, spacing } from '../../constants/typography';

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expired', label: 'Expired' },
  { key: 'expiring', label: 'Expiring' },
];

const CATEGORY_ICONS: Record<string, string> = {
  'Entertainment': 'film-outline',
  'Productivity': 'rocket-outline',
  'Utilities': 'construct-outline',
  'Gaming': 'game-controller-outline',
  'Health & Fitness': 'heart-outline',
  'News & Reading': 'newspaper-outline',
  'AI': 'hardware-chip-outline',
  'Dev Tools': 'code-slash-outline',
  'Recharges': 'flash-outline',
  'Other': 'ellipsis-horizontal-outline',
  'Uncategorized': 'apps-outline',
};

export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();
  const { subscriptions, isLoaded, deleteSubscription, getTotalAmount, refresh } = useSubscriptions();
  const { currencyCode, convertAmount, refresh: refreshCurrency } = useCurrency();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChart, setShowChart] = useState(true);
  const [groupByCategory, setGroupByCategory] = useState(false);

  const isExpired = (date: string) => new Date(date).getTime() < Date.now();

  const filteredSubscriptions = useMemo(() => {
    let result = subscriptions;

    // Apply filter
    if (filter === 'active') result = result.filter(s => s.isActive && !isExpired(s.expiryDate));
    else if (filter === 'expired') result = result.filter(s => isExpired(s.expiryDate) || !s.isActive);
    else if (filter === 'expiring') {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      result = result.filter(s => {
        if (!s.isActive || isExpired(s.expiryDate)) return false;
        const daysLeft = new Date(s.expiryDate).getTime() - Date.now();
        return daysLeft > 0 && daysLeft <= sevenDays;
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [subscriptions, filter, searchQuery]);

  // Group by category for SectionList
  const categorySections = useMemo(() => {
    if (!groupByCategory) return [];
    const map = new Map<string, Subscription[]>();
    filteredSubscriptions.forEach(sub => {
      const cat = sub.category || 'Uncategorized';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(sub);
    });
    return Array.from(map.entries())
      .map(([title, data]) => ({
        title,
        data,
        icon: CATEGORY_ICONS[title] || 'apps-outline',
        count: data.length,
        total: data.reduce((sum, s) => sum + convertAmount(s.amount, s.currency), 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredSubscriptions, groupByCategory, convertAmount]);

  const totalAmount = getTotalAmount(convertAmount);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshCurrency();
    }, [refresh, refreshCurrency])
  );

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/modals/add-subscription');
  };

  const handleEdit = (subscription: Subscription) => {
    router.push({
      pathname: '/modals/edit-subscription',
      params: { id: subscription.id },
    });
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteSubscription(deleteId);
      setDeleteId(null);
    }
  };

  const renderItem = ({ item }: { item: Subscription }) => (
    <SwipeableRow
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item.id)}
    >
      <SubscriptionCard 
        subscription={item} 
        onDelete={() => handleDelete(item.id)}
      />
    </SwipeableRow>
  );

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <View style={styles.sectionIconWrap}>
          <Ionicons name={section.icon as any} size={16} color={colors.accent.blue} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{section.count}</Text>
        </View>
      </View>
      <Text style={styles.sectionTotal}>
        {formatCurrency(section.total, currencyCode)}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>
              {subscriptions.filter(s => s.isActive).length} active
            </Text>
          </View>
        </View>
        <Text style={styles.summaryAmount}>
          {formatCurrency(totalAmount, currencyCode)}
        </Text>
      </View>

      {/* Chart Toggle + Chart */}
      {subscriptions.length > 0 && (
        <TouchableOpacity
          style={styles.chartToggle}
          onPress={() => setShowChart(!showChart)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showChart ? 'chevron-up' : 'bar-chart-outline'}
            size={16}
            color={colors.accent.blue}
          />
          <Text style={styles.chartToggleText}>
            {showChart ? 'Hide Chart' : 'Show Spending Chart'}
          </Text>
        </TouchableOpacity>
      )}

      {showChart && subscriptions.length > 0 && (
        <SpendingChart subscriptions={subscriptions} currencyCode={currencyCode} />
      )}

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search subscriptions..."
        accentColor={colors.accent.blue}
      />

      {/* Filter + Category Toggle Row */}
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
        {/* Category Group Toggle */}
        {subscriptions.length > 0 && (
          <TouchableOpacity
            style={[styles.filterPill, styles.categoryToggle, groupByCategory && styles.categoryToggleActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setGroupByCategory(!groupByCategory);
            }}
          >
            <Ionicons
              name={groupByCategory ? 'grid' : 'grid-outline'}
              size={14}
              color={groupByCategory ? colors.accent.purple : colors.text.muted}
            />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  // Skeleton Loading
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <AmbientBackground />
        <View style={styles.header}>
          <Text style={styles.title}>Subscriptions</Text>
          <View style={styles.headerRight}>
            <View style={styles.addButton}>
              <Ionicons name="add" size={22} color={colors.accent.blue} />
            </View>
            <View style={styles.iconButton}>
              <Ionicons name="settings-outline" size={22} color={colors.text.tertiary} />
            </View>
          </View>
        </View>
        <SkeletonLoader variant="subscriptions" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AmbientBackground />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Subscriptions</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Ionicons name="add" size={22} color={colors.accent.blue} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/modals/settings')}>
            <Ionicons name="settings-outline" size={22} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Empty State */}
      {filteredSubscriptions.length === 0 && !searchQuery ? (
        <>
          {renderHeader()}
          <EmptyState
            icon="card-outline"
            title="No subscriptions yet"
            subtitle="Track all your recurring payments in one place"
            actionLabel="Add Subscription"
            onAction={handleAddPress}
            variant="subscriptions"
          />
        </>
      ) : groupByCategory && categorySections.length > 0 ? (
        /* Category Grouped View */
        <SectionList
          sections={categorySections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.blue}
              colors={[colors.accent.blue]}
              progressBackgroundColor="#1a1a2e"
            />
          }
        />
      ) : (
        /* Normal List View */
        <FlatList
          data={filteredSubscriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.blue}
              colors={[colors.accent.blue]}
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
        title="Delete Subscription"
        message="Are you sure you want to permanently delete this subscription? This will clean it from storage."
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.tertiary,
    fontSize: 16,
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
    backgroundColor: 'rgba(79,195,247,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(79,195,247,0.3)',
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
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(102,187,106,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(102,187,106,0.3)',
  },
  activeBadgeText: {
    color: '#66BB6A',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryAmount: {
    color: colors.text.primary,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  chartToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(79,195,247,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(79,195,247,0.15)',
  },
  chartToggleText: {
    color: colors.accent.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
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
    backgroundColor: 'rgba(79,195,247,0.15)',
    borderColor: 'rgba(79,195,247,0.4)',
  },
  filterText: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.accent.blue,
    fontWeight: '600',
  },
  categoryToggle: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  categoryToggleActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderColor: 'rgba(124,58,237,0.4)',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(79,195,247,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionCount: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.glass.buttonSecondary,
  },
  sectionCountText: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTotal: {
    color: colors.accent.blue,
    fontSize: 14,
    fontWeight: '700',
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
