import { useState, useCallback, useEffect } from 'react';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';
import * as Crypto from 'expo-crypto';

export interface SpendingEntry {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  spentAt: string;
  notes?: string;
  createdAt: string;
}

export interface SpendingInput {
  title: string;
  amount: number;
  currency: string;
  category: string;
  spentAt: string;
  notes?: string;
}

export interface WeeklyDayData {
  dayLabel: string;
  date: string;
  total: number;
  isToday: boolean;
  hasEntries: boolean;
}

const getDayKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to get all days in the current month up to today
const getDaysInMonthSoFar = (): number => {
  return new Date().getDate();
};

export const useDailySpending = () => {
  const [entries, setEntries] = useState<SpendingEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const raw = await storage.getString(STORAGE_KEYS.DAILY_SPENDING);
      if (raw) {
        const parsed = JSON.parse(raw);
        setEntries(Array.isArray(parsed) ? parsed : []);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const saveEntries = useCallback((entryList: SpendingEntry[]) => {
    storage.set(STORAGE_KEYS.DAILY_SPENDING, JSON.stringify(entryList));
    setEntries(entryList);
  }, []);

  const addEntry = useCallback((input: SpendingInput) => {
    const newEntry: SpendingEntry = {
      ...input,
      id: Crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    saveEntries(updated);
    return newEntry;
  }, [entries, saveEntries]);

  const updateEntry = useCallback((id: string, updates: Partial<SpendingInput>) => {
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    saveEntries(updated);
  }, [entries, saveEntries]);

  const deleteEntry = useCallback((id: string) => {
    const updated = entries.filter((entry) => entry.id !== id);
    saveEntries(updated);
  }, [entries, saveEntries]);

  const getEntryById = useCallback((id: string) => {
    return entries.find((entry) => entry.id === id);
  }, [entries]);

  const getEntriesForDay = useCallback((date: Date) => {
    const key = getDayKey(date);
    return entries.filter((entry) => getDayKey(new Date(entry.spentAt)) === key);
  }, [entries]);

  const getTotalForDay = useCallback((date: Date) => {
    return getEntriesForDay(date).reduce((total, entry) => total + entry.amount, 0);
  }, [getEntriesForDay]);

  const getTotalForWeek = useCallback(() => {
    const today = new Date();
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const day = addDays(today, -i);
      total += getEntriesForDay(day).reduce((sum, e) => sum + e.amount, 0);
    }
    return total;
  }, [getEntriesForDay]);

  const getTotalForMonth = useCallback((date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    return entries
      .filter((entry) => {
        const spent = new Date(entry.spentAt);
        return spent.getMonth() === month && spent.getFullYear() === year;
      })
      .reduce((total, entry) => total + entry.amount, 0);
  }, [entries]);

  const getDailyAverage = useCallback(() => {
    if (entries.length === 0) return 0;
    const dayKeys = new Set(entries.map((e) => getDayKey(new Date(e.spentAt))));
    const totalDays = dayKeys.size;
    if (totalDays === 0) return 0;
    const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
    return Math.round((totalAmount / totalDays) * 100) / 100;
  }, [entries]);

  const getNoSpendDaysThisMonth = useCallback(() => {
    if (entries.length === 0) return 0;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Find the earliest entry date to know when they actually started tracking
    const earliestDate = new Date(
      Math.min(...entries.map((e) => new Date(e.spentAt).getTime()))
    );

    let trackingDaysThisMonth = 0;

    // If they started tracking in a previous month, they've been tracking all month
    if (
      earliestDate.getFullYear() < year ||
      (earliestDate.getFullYear() === year && earliestDate.getMonth() < month)
    ) {
      trackingDaysThisMonth = today.getDate();
    } else {
      // They started tracking THIS month
      trackingDaysThisMonth = today.getDate() - earliestDate.getDate() + 1;
    }

    const spendingDayKeysThisMonth = new Set(
      entries
        .filter((e) => {
          const d = new Date(e.spentAt);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .map((e) => getDayKey(new Date(e.spentAt)))
    );

    return Math.max(0, trackingDaysThisMonth - spendingDayKeysThisMonth.size);
  }, [entries]);

  const getNoSpendDaysTotal = useCallback(() => {
    if (entries.length === 0) return 0;
    
    // Find earliest entry date
    const earliestDate = new Date(
      Math.min(...entries.map(e => new Date(e.spentAt).getTime()))
    );
    const today = new Date();
    
    // Calculate total days tracked
    const diffTime = Math.abs(today.getTime() - earliestDate.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const allSpendingDayKeys = new Set(entries.map(e => getDayKey(new Date(e.spentAt))));
    
    return Math.max(0, totalDays - allSpendingDayKeys.size);
  }, [entries]);

  const getSavingMessage = useCallback(() => {
    const noSpendDays = getNoSpendDaysThisMonth();
    if (noSpendDays === 0) return "Tracked every day. Try a no-spend day! 💡";
    if (noSpendDays < 3) return `${noSpendDays} no-spend days. Good start! 🌱`;
    if (noSpendDays < 7) return `${noSpendDays} no-spend days! Great saving habits 📈`;
    if (noSpendDays < 15) return `${noSpendDays} no-spend days! Incredible discipline! 💰`;
    return `${noSpendDays} no-spend days! Financial Zen! 🧘‍♂️`;
  }, [getNoSpendDaysThisMonth]);

  const getWeeklyData = useCallback((): WeeklyDayData[] => {
    const today = new Date();
    const result: WeeklyDayData[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = addDays(today, -i);
      const dayEntries = getEntriesForDay(day);
      const total = dayEntries.reduce((sum, e) => sum + e.amount, 0);
      result.push({
        dayLabel: DAY_LABELS[day.getDay()],
        date: getDayKey(day),
        total,
        isToday: i === 0,
        hasEntries: dayEntries.length > 0,
      });
    }

    return result;
  }, [getEntriesForDay]);

  const getCategoryTotals = useCallback(() => {
    const totals = new Map<string, number>();
    entries.forEach((entry) => {
      totals.set(entry.category, (totals.get(entry.category) || 0) + entry.amount);
    });
    return Array.from(totals.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [entries]);

  return {
    entries,
    isLoaded,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    getEntriesForDay,
    getTotalForDay,
    getTotalForWeek,
    getTotalForMonth,
    getDailyAverage,
    getNoSpendDaysThisMonth,
    getNoSpendDaysTotal,
    getSavingMessage,
    getWeeklyData,
    getCategoryTotals,
    refresh: loadEntries,
  };
};
