import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
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
import { useSubscriptions, Subscription } from '../../hooks/useSubscriptions';
import { formatCurrency } from '../../utils/dateHelpers';
import { colors } from '../../constants/colors';
import { typography, spacing } from '../../constants/typography';

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expired', label: 'Expired' },
  { key: 'expiring', label: 'Expiring' },
];

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { subscriptions, isLoaded, deleteSubscription, getTotalAmount, refresh } = useSubscriptions();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isExpired = (date: string) => new Date(date).getTime() < Date.now();

  const filteredSubscriptions = useMemo(() => {
    if (filter === 'all') return subscriptions;
    if (filter === 'active') return subscriptions.filter(s => s.isActive && !isExpired(s.expiryDate));
    if (filter === 'expired') return subscriptions.filter(s => isExpired(s.expiryDate) || !s.isActive);
    if (filter === 'expiring') {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      return subscriptions.filter(s => {
        if (!s.isActive || isExpired(s.expiryDate)) return false;
        const daysLeft = new Date(s.expiryDate).getTime() - Date.now();
        return daysLeft > 0 && daysLeft <= sevenDays;
      });
    }
    return subscriptions;
  }, [subscriptions, filter]);

  const totalAmount = getTotalAmount();

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

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <AmbientBackground />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
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
          {formatCurrency(totalAmount, 'INR')}
        </Text>
      </View>

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

      {/* List */}
      {filteredSubscriptions.length === 0 ? (
        <EmptyState
          icon="card-outline"
          title="No subscriptions yet"
          subtitle="Track all your recurring payments in one place"
          actionLabel="Add Subscription"
          onAction={handleAddPress}
        />
      ) : (
        <FlatList
          data={filteredSubscriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c14',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
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
  listContent: {
    paddingTop: 4,
    paddingBottom: 120,
  },
});
