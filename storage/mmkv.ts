import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'subdebt-storage',
  encryptionKey: 'subdebt-secure-key'
});

export const hydrateStorage = async (): Promise<void> => {
  // react-native-mmkv is natively synchronous and extremely fast.
  // No artificial hydration delay is needed in production!
  return Promise.resolve();
};
