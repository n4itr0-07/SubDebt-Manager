import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';

interface ExportData {
  version: string;
  exportedAt: string;
  subscriptions: any[];
  debts: any[];
}

export const exportAllData = async (): Promise<boolean> => {
  try {
    const subscriptionsRaw = storage.getString(STORAGE_KEYS.SUBSCRIPTIONS);
    const debtsRaw = storage.getString(STORAGE_KEYS.DEBTS);

    const exportData: ExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subscriptions: subscriptionsRaw ? JSON.parse(subscriptionsRaw) : [],
      debts: debtsRaw ? JSON.parse(debtsRaw) : [],
    };

    const fileName = `subdebt-backup-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(exportData, null, 2)
    );

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export SubDebt Backup',
      });
      return true;
    }

    return false;
  } catch {
    return false;
  }
};
