import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  getDriveTokens,
  saveDriveTokens,
  clearDriveTokens,
  uploadBackupToDrive,
  downloadBackupFromDrive,
  getValidAccessToken,
} from '../utils/googleDrive';
import { storage } from '../storage/mmkv';

WebBrowser.maybeCompleteAuthSession();

export const useCloudSync = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    // Web client ID — used for the server-side token exchange
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    // Android client ID — required for native Android (Expo Go + production APK)
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.appdata'],
    extraParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const token = await getValidAccessToken();
    setIsConnected(!!token);
    const syncTime = await storage.getString('LAST_CLOUD_SYNC');
    setLastSync(syncTime || null);
  };

  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      handleAuthSuccess(response.authentication);
    }
  }, [response]);

  const handleAuthSuccess = async (auth: any) => {
    await saveDriveTokens({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      expiresIn: auth.expiresIn,
      issuedAt: Math.floor(Date.now() / 1000),
    });
    setIsConnected(true);
  };

  const connect = async () => {
    if (request) {
      await promptAsync();
    }
  };

  const disconnect = async () => {
    await clearDriveTokens();
    setIsConnected(false);
  };

  const backupNow = async (): Promise<boolean> => {
    setIsSyncing(true);
    const success = await uploadBackupToDrive();
    if (success) {
      const syncTime = await storage.getString('LAST_CLOUD_SYNC');
      setLastSync(syncTime || null);
    }
    setIsSyncing(false);
    return success;
  };

  const restoreNow = async (): Promise<any | null> => {
    setIsSyncing(true);
    const data = await downloadBackupFromDrive();
    setIsSyncing(false);
    return data;
  };

  return {
    isConnected,
    isSyncing,
    lastSync,
    connect,
    disconnect,
    backupNow,
    restoreNow,
    isReady: !!request,
  };
};
