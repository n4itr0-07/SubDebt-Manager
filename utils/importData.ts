import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';

interface ImportData {
  version: string;
  exportedAt: string;
  subscriptions: any[];
  debts: any[];
}

interface ImportResult {
  success: boolean;
  subscriptionsCount: number;
  debtsCount: number;
  error?: string;
}

export const pickAndImportData = async (mode: 'merge' | 'replace' = 'merge'): Promise<ImportResult> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return {
        success: false,
        subscriptionsCount: 0,
        debtsCount: 0,
        error: 'User cancelled',
      };
    }

    const file = result.assets[0];
    const fileContent = await FileSystem.readAsStringAsync(file.uri);
    const data: ImportData = JSON.parse(fileContent);

    // Validate data structure
    if (!data.version || !Array.isArray(data.subscriptions) || !Array.isArray(data.debts)) {
      return {
        success: false,
        subscriptionsCount: 0,
        debtsCount: 0,
        error: 'Invalid backup file format',
      };
    }

    if (mode === 'replace') {
      await storage.set(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(data.subscriptions));
      await storage.set(STORAGE_KEYS.DEBTS, JSON.stringify(data.debts));
    } else {
      // Merge mode - skip duplicates by ID
      const existingSubsRaw = await storage.getString(STORAGE_KEYS.SUBSCRIPTIONS);
      const existingDebtsRaw = await storage.getString(STORAGE_KEYS.DEBTS);
      
      const existingSubs = existingSubsRaw ? JSON.parse(existingSubsRaw) : [];
      const existingDebts = existingDebtsRaw ? JSON.parse(existingDebtsRaw) : [];

      const existingSubIds = new Set(existingSubs.map((s: any) => s.id));
      const existingDebtIds = new Set(existingDebts.map((d: any) => d.id));

      const newSubs = data.subscriptions.filter((s: any) => !existingSubIds.has(s.id));
      const newDebts = data.debts.filter((d: any) => !existingDebtIds.has(d.id));

      const mergedSubs = [...existingSubs, ...newSubs];
      const mergedDebts = [...existingDebts, ...newDebts];

      await storage.set(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(mergedSubs));
      await storage.set(STORAGE_KEYS.DEBTS, JSON.stringify(mergedDebts));
    }

    return {
      success: true,
      subscriptionsCount: data.subscriptions.length,
      debtsCount: data.debts.length,
    };
  } catch (error) {
    return {
      success: false,
      subscriptionsCount: 0,
      debtsCount: 0,
      error: error instanceof Error ? error.message : 'Import failed',
    };
  }
};

export const clearAllData = async (): Promise<boolean> => {
  try {
    await storage.clearAll();
    return true;
  } catch {
    return false;
  }
};
