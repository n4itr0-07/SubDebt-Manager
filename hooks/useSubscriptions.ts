import { useState, useCallback, useEffect } from 'react';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';
import * as Crypto from 'expo-crypto';
import { getIconKeyFromName } from '../utils/subscriptionIcons';

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'custom';

export interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: string;
  expiryDate: string;
  category?: string;
  color?: string;
  iconKey?: string;
  isActive: boolean;
  createdAt: string;
}

export interface SubscriptionInput {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: string;
  expiryDate: string;
  category?: string;
  color?: string;
  isActive: boolean;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    try {
      const raw = await storage.getString(STORAGE_KEYS.SUBSCRIPTIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSubscriptions(parsed);
      } else {
        setSubscriptions([]);
      }
    } catch {
      setSubscriptions([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const saveSubscriptions = useCallback((subs: Subscription[]) => {
    storage.set(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
    setSubscriptions(subs);
  }, []);

  const addSubscription = useCallback((input: SubscriptionInput) => {
    const newSubscription: Subscription = {
      ...input,
      id: Crypto.randomUUID(),
      iconKey: getIconKeyFromName(input.name),
      createdAt: new Date().toISOString(),
    };

    const updated = [newSubscription, ...subscriptions];
    saveSubscriptions(updated);
    return newSubscription;
  }, [subscriptions, saveSubscriptions]);

  const updateSubscription = useCallback((id: string, updates: Partial<SubscriptionInput>) => {
    const updated = subscriptions.map((sub) => {
      if (sub.id === id) {
        const updatedSub = { ...sub, ...updates };
        if (updates.name) {
          updatedSub.iconKey = getIconKeyFromName(updates.name);
        }
        return updatedSub;
      }
      return sub;
    });
    saveSubscriptions(updated);
  }, [subscriptions, saveSubscriptions]);

  const deleteSubscription = useCallback((id: string) => {
    const updated = subscriptions.filter((sub) => sub.id !== id);
    saveSubscriptions(updated);
  }, [subscriptions, saveSubscriptions]);

  const toggleSubscriptionActive = useCallback((id: string) => {
    const updated = subscriptions.map((sub) =>
      sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
    );
    saveSubscriptions(updated);
  }, [subscriptions, saveSubscriptions]);

  const getSubscriptionById = useCallback((id: string) => {
    return subscriptions.find((sub) => sub.id === id);
  }, [subscriptions]);

  const getTotalAmount = useCallback(() => {
    const now = Date.now();
    return subscriptions
      .filter((sub) => {
        if (!sub.isActive) return false;
        // If no expiry date, it's active
        if (!sub.expiryDate) return true;
        // Check if not expired
        return new Date(sub.expiryDate).getTime() > now;
      })
      .reduce((total, sub) => total + sub.amount, 0);
  }, [subscriptions]);

  return {
    subscriptions,
    isLoaded,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
    getSubscriptionById,
    getTotalAmount,
    refresh: loadSubscriptions,
  };
};
