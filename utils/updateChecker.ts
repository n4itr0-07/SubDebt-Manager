import { Linking } from 'react-native';
import { storage } from '../storage/mmkv';
import Constants from 'expo-constants';

const GITHUB_REPO = 'n4itr0-07/SubDebt-Manager';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const SKIP_VERSION_KEY = 'skipped_update_version';
const LAST_CHECK_KEY = 'last_update_check';
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  releaseUrl: string;
  downloadUrl: string;
  publishedAt: string;
}

const parseVersion = (v: string): number[] => {
  return v.replace(/^v/, '').split('.').map(Number);
};

const isNewer = (latest: string, current: string): boolean => {
  const l = parseVersion(latest);
  const c = parseVersion(current);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const lv = l[i] || 0;
    const cv = c[i] || 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
};

export const getCurrentVersion = (): string => {
  return Constants.expoConfig?.version || '1.3.0';
};

export const checkForUpdate = async (force = false): Promise<UpdateInfo | null> => {
  try {
    if (!force) {
      const lastCheck = await storage.getString(LAST_CHECK_KEY);
      if (lastCheck) {
        const elapsed = Date.now() - parseInt(lastCheck, 10);
        if (elapsed < CHECK_INTERVAL_MS) return null;
      }
    }

    await storage.set(LAST_CHECK_KEY, Date.now().toString());

    const response = await fetch(API_URL, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });

    if (!response.ok) return null;

    const release = await response.json();
    const latestVersion = release.tag_name?.replace(/^v/, '') || '';
    const currentVersion = getCurrentVersion();

    if (!isNewer(latestVersion, currentVersion)) {
      return {
        available: false,
        currentVersion,
        latestVersion,
        releaseNotes: '',
        releaseUrl: '',
        downloadUrl: '',
        publishedAt: '',
      };
    }

    if (!force) {
      const skipped = await storage.getString(SKIP_VERSION_KEY);
      if (skipped === latestVersion) return null;
    }

    const arm64Asset = release.assets?.find(
      (a: any) => a.name?.includes('arm64')
    );
    const universalAsset = release.assets?.find(
      (a: any) => a.name?.includes('universal')
    );
    const downloadUrl = arm64Asset?.browser_download_url
      || universalAsset?.browser_download_url
      || release.html_url;

    return {
      available: true,
      currentVersion,
      latestVersion,
      releaseNotes: release.body || '',
      releaseUrl: release.html_url,
      downloadUrl,
      publishedAt: release.published_at || '',
    };
  } catch {
    return null;
  }
};

export const skipVersion = async (version: string) => {
  await storage.set(SKIP_VERSION_KEY, version);
};

export const openDownloadUrl = (url: string) => {
  Linking.openURL(url);
};
