import { useState, useCallback, useEffect } from 'react';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';
import * as Crypto from 'expo-crypto';

export interface Credit {
  id: string;
  personName: string;
  phoneNumber?: string;
  amount: number;
  currency: string;
  purpose?: string;
  lentDate: string;
  expectedReturnDate?: string;
  isReturned: boolean;
  returnedDate?: string;
  notes?: string;
  createdAt: string;
}

export interface CreditInput {
  personName: string;
  phoneNumber?: string;
  amount: number;
  currency: string;
  purpose?: string;
  lentDate: string;
  expectedReturnDate?: string;
  notes?: string;
  isReturned?: boolean;
}

export const useCredits = () => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadCredits = useCallback(async () => {
    try {
      const raw = await storage.getString(STORAGE_KEYS.CREDITS);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCredits(Array.isArray(parsed) ? parsed : []);
      } else {
        setCredits([]);
      }
    } catch {
      setCredits([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  const saveCredits = useCallback((creditsList: Credit[]) => {
    storage.set(STORAGE_KEYS.CREDITS, JSON.stringify(creditsList));
    setCredits(creditsList);
  }, []);

  const addCredit = useCallback((input: CreditInput) => {
    const newCredit: Credit = {
      ...input,
      id: Crypto.randomUUID(),
      isReturned: input.isReturned ?? false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCredit, ...credits];
    saveCredits(updated);
    return newCredit;
  }, [credits, saveCredits]);

  const updateCredit = useCallback((id: string, updates: Partial<CreditInput>) => {
    const updated = credits.map((credit) =>
      credit.id === id ? { ...credit, ...updates } : credit
    );
    saveCredits(updated);
  }, [credits, saveCredits]);

  const deleteCredit = useCallback((id: string) => {
    const updated = credits.filter((credit) => credit.id !== id);
    saveCredits(updated);
  }, [credits, saveCredits]);

  const markCreditAsReturned = useCallback((id: string) => {
    const updated = credits.map((credit) =>
      credit.id === id
        ? { ...credit, isReturned: true, returnedDate: new Date().toISOString() }
        : credit
    );
    saveCredits(updated);
  }, [credits, saveCredits]);

  const markCreditAsPending = useCallback((id: string) => {
    const updated = credits.map((credit) =>
      credit.id === id
        ? { ...credit, isReturned: false, returnedDate: undefined }
        : credit
    );
    saveCredits(updated);
  }, [credits, saveCredits]);

  const getCreditById = useCallback((id: string) => {
    return credits.find((credit) => credit.id === id);
  }, [credits]);

  const getTotalPendingAmount = useCallback(() => {
    return credits
      .filter((credit) => !credit.isReturned)
      .reduce((total, credit) => total + credit.amount, 0);
  }, [credits]);

  const getTotalReturnedAmount = useCallback(() => {
    return credits
      .filter((credit) => credit.isReturned)
      .reduce((total, credit) => total + credit.amount, 0);
  }, [credits]);

  return {
    credits,
    isLoaded,
    addCredit,
    updateCredit,
    deleteCredit,
    markCreditAsReturned,
    markCreditAsPending,
    getCreditById,
    getTotalPendingAmount,
    getTotalReturnedAmount,
    refresh: loadCredits,
  };
};
