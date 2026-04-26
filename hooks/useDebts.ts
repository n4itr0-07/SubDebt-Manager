import { useState, useCallback, useEffect } from 'react';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';
import * as Crypto from 'expo-crypto';

export interface Debt {
  id: string;
  personName: string;
  phoneNumber?: string;
  amount: number;
  currency: string;
  purpose?: string;
  takenDate: string;
  dueDate?: string;
  isPaid: boolean;
  paidDate?: string;
  notes?: string;
  createdAt: string;
}

export interface DebtInput {
  personName: string;
  phoneNumber?: string;
  amount: number;
  currency: string;
  purpose?: string;
  takenDate: string;
  dueDate?: string;
  notes?: string;
  isPaid?: boolean;
}

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadDebts = useCallback(async () => {
    try {
      const raw = await storage.getString(STORAGE_KEYS.DEBTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        setDebts(parsed);
      } else {
        setDebts([]);
      }
    } catch {
      setDebts([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const saveDebts = useCallback((debtsList: Debt[]) => {
    storage.set(STORAGE_KEYS.DEBTS, JSON.stringify(debtsList));
    setDebts(debtsList);
  }, []);

  const addDebt = useCallback((input: DebtInput) => {
    const newDebt: Debt = {
      ...input,
      id: Crypto.randomUUID(),
      isPaid: input.isPaid ?? false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newDebt, ...debts];
    saveDebts(updated);
    return newDebt;
  }, [debts, saveDebts]);

  const updateDebt = useCallback((id: string, updates: Partial<DebtInput>) => {
    const updated = debts.map((debt) =>
      debt.id === id ? { ...debt, ...updates } : debt
    );
    saveDebts(updated);
  }, [debts, saveDebts]);

  const deleteDebt = useCallback((id: string) => {
    const updated = debts.filter((debt) => debt.id !== id);
    saveDebts(updated);
  }, [debts, saveDebts]);

  const markDebtAsPaid = useCallback((id: string) => {
    const updated = debts.map((debt) =>
      debt.id === id
        ? { ...debt, isPaid: true, paidDate: new Date().toISOString() }
        : debt
    );
    saveDebts(updated);
  }, [debts, saveDebts]);

  const markDebtAsUnpaid = useCallback((id: string) => {
    const updated = debts.map((debt) =>
      debt.id === id
        ? { ...debt, isPaid: false, paidDate: undefined }
        : debt
    );
    saveDebts(updated);
  }, [debts, saveDebts]);

  const getDebtById = useCallback((id: string) => {
    return debts.find((debt) => debt.id === id);
  }, [debts]);

  const getTotalPendingAmount = useCallback(() => {
    return debts
      .filter((debt) => !debt.isPaid)
      .reduce((total, debt) => total + debt.amount, 0);
  }, [debts]);

  const getTotalPaidAmount = useCallback(() => {
    return debts
      .filter((debt) => debt.isPaid)
      .reduce((total, debt) => total + debt.amount, 0);
  }, [debts]);

  return {
    debts,
    isLoaded,
    addDebt,
    updateDebt,
    deleteDebt,
    markDebtAsPaid,
    markDebtAsUnpaid,
    getDebtById,
    getTotalPendingAmount,
    getTotalPaidAmount,
    refresh: loadDebts,
  };
};
