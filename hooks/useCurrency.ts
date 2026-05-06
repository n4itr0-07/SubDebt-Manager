import { useState, useCallback, useEffect } from 'react';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';
import { getCurrencyByCode, DEFAULT_CURRENCY_CODE, Currency } from '../constants/currencies';

const RATES_KEY = 'exchange_rates_v1';
const LAST_FETCH_KEY = 'exchange_rates_last_fetch';
const API_KEY = process.env.EXPO_PUBLIC_EXCHANGE_RATE_API_KEY;

let globalRates: Record<string, number> = {};

export const useCurrency = () => {
  const [currencyCode, setCurrencyCode] = useState<string>(DEFAULT_CURRENCY_CODE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>(globalRates);

  const loadCurrency = useCallback(async () => {
    try {
      const saved = await storage.getString(STORAGE_KEYS.CURRENCY);
      if (saved) setCurrencyCode(saved);
      
      const storedRates = await storage.getString(RATES_KEY);
      if (storedRates) {
        const parsedRates = JSON.parse(storedRates);
        globalRates = parsedRates;
        setRates(parsedRates);
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  const fetchRates = useCallback(async () => {
    if (!API_KEY) return;
    try {
      const lastFetchStr = await storage.getString(LAST_FETCH_KEY);
      const now = Date.now();
      if (lastFetchStr && now - parseInt(lastFetchStr) < 60 * 60 * 1000) {
        return; // less than an hour ago
      }
      const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
      const data = await res.json();
      if (data.result === 'success' && data.conversion_rates) {
        await storage.set(RATES_KEY, JSON.stringify(data.conversion_rates));
        await storage.set(LAST_FETCH_KEY, now.toString());
        globalRates = data.conversion_rates;
        setRates(data.conversion_rates);
      }
    } catch (err) {
      console.error('Failed to fetch rates', err);
    }
  }, []);

  useEffect(() => {
    loadCurrency().then(() => fetchRates());
  }, [loadCurrency, fetchRates]);

  const setCurrency = useCallback(async (code: string) => {
    setCurrencyCode(code);
    await storage.set(STORAGE_KEYS.CURRENCY, code);
  }, []);

  const convertAmount = useCallback((amount: number, fromCode: string) => {
    if (fromCode === currencyCode) return amount;
    if (!rates || Object.keys(rates).length === 0) return amount;
    const fromRate = rates[fromCode] || 1;
    const toRate = rates[currencyCode] || 1;
    return (amount / fromRate) * toRate;
  }, [currencyCode, rates]);

  return {
    currencyCode,
    currency: getCurrencyByCode(currencyCode),
    setCurrency,
    isLoaded,
    refresh: loadCurrency,
    convertAmount,
  };
};
