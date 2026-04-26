import { useState, useCallback, useEffect } from 'react';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';
import { getCurrencyByCode, DEFAULT_CURRENCY_CODE, Currency } from '../constants/currencies';

/**
 * Hook for managing the user's selected currency.
 * Persists selection to MMKV storage.
 */
export const useCurrency = () => {
  const [currencyCode, setCurrencyCode] = useState<string>(DEFAULT_CURRENCY_CODE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const saved = await storage.getString(STORAGE_KEYS.CURRENCY);
        if (saved) {
          setCurrencyCode(saved);
        }
      } catch {
        // Fall back to default
      }
      setIsLoaded(true);
    };
    loadCurrency();
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyCode(code);
    storage.set(STORAGE_KEYS.CURRENCY, code);
  }, []);

  const currency: Currency = getCurrencyByCode(currencyCode);

  return {
    currencyCode,
    currency,
    setCurrency,
    isLoaded,
  };
};
