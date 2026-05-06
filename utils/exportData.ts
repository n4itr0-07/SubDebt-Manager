import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../storage/keys';

interface ExportData {
  version: string;
  exportedAt: string;
  subscriptions: any[];
  credits: any[];
  debts: any[];
  dailySpending: any[];
}

export const exportAllData = async (): Promise<boolean> => {
  try {
    const subscriptionsRaw = await storage.getString(STORAGE_KEYS.SUBSCRIPTIONS);
    const creditsRaw = await storage.getString(STORAGE_KEYS.CREDITS);
    const debtsRaw = await storage.getString(STORAGE_KEYS.DEBTS);
    const dailySpendingRaw = await storage.getString(STORAGE_KEYS.DAILY_SPENDING);

    const exportData: ExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subscriptions: subscriptionsRaw ? JSON.parse(subscriptionsRaw) : [],
      credits: creditsRaw ? JSON.parse(creditsRaw) : [],
      debts: debtsRaw ? JSON.parse(debtsRaw) : [],
      dailySpending: dailySpendingRaw ? JSON.parse(dailySpendingRaw) : [],
    };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const fileName = `SubDebt_Backup_${dateStr}_${timeStr}.json`;

    if (Platform.OS === 'android') {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/json'
        );
        await FileSystem.writeAsStringAsync(
          uri,
          JSON.stringify(exportData, null, 2)
        );
        return true;
      }
      return false; // User cancelled
    }

    // iOS fallback
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(exportData, null, 2)
    );

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export SubDebt Backup',
        UTI: 'public.json',
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
};
