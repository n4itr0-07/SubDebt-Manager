import { useTheme } from '../../hooks/useTheme';
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientBackground } from '../../components/AmbientBackground';
import { GlassButton } from '../../components/GlassButton';
import { AppPopup } from '../../components/AppPopup';
import { CurrencyPicker } from '../../components/CurrencyPicker';
import { exportAllData } from '../../utils/exportData';
import { pickAndImportData, clearAllData } from '../../utils/importData';
import { useDebts } from '../../hooks/useDebts';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useCredits } from '../../hooks/useCredits';
import { useDailySpending } from '../../hooks/useDailySpending';
import { useCurrency } from '../../hooks/useCurrency';
import { storage } from '../../storage/mmkv';
import { STORAGE_KEYS } from '../../storage/keys';
import Constants from 'expo-constants';

export default function SettingsModal() {
  const { colors, mode, setMode, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const router = useRouter();
  const { refresh: refreshDebts } = useDebts();
  const { refresh: refreshSubs } = useSubscriptions();
  const { refresh: refreshCredits } = useCredits();
  const { refresh: refreshSpending } = useDailySpending();
  const { currency, setCurrency: setSelectedCurrency } = useCurrency();
  
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Popup state
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState<any>({});

  const showPopup = (config: any) => {
    setPopupConfig(config);
    setPopupVisible(true);
  };

  const closePopup = () => setPopupVisible(false);

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExporting(true);
    const success = await exportAllData();
    setExporting(false);
    
    showPopup({
      title: success ? 'Export Successful' : 'Export Failed',
      message: success ? 'Your data has been successfully exported.' : 'There was a problem exporting your data.',
      icon: success ? 'checkmark-circle-outline' : 'close-circle-outline',
      iconColor: success ? '#66BB6A' : colors.accent.red,
      confirmText: 'Done',
      onConfirm: closePopup,
    });
  };

  const handleImportMerge = async () => {
    setImporting(true);
    const result = await pickAndImportData('merge');
    setImporting(false);
    
    if (result.success) { 
      refreshDebts(); refreshSubs(); refreshCredits(); refreshSpending();
      showPopup({
        title: 'Import Successful',
        message: `Merged ${result.subscriptionsCount} subs, ${result.creditsCount} lent, ${result.debtsCount} debts, ${result.spendingCount} spending entries.`,
        icon: 'checkmark-circle-outline',
        iconColor: '#66BB6A',
        confirmText: 'Done',
        onConfirm: closePopup,
      });
    } else if (result.error !== 'User cancelled') {
      showPopup({
        title: 'Import Failed',
        message: result.error || 'Unknown error',
        icon: 'close-circle-outline',
        iconColor: colors.accent.red,
        confirmText: 'Close',
        onConfirm: closePopup,
      });
    }
  };

  const handleImportReplace = () => {
    showPopup({
      title: 'Replace All Data?',
      message: 'This will permanently DELETE all existing data and replace it. This cannot be undone.',
      icon: 'warning-outline',
      iconColor: colors.accent.red,
      cancelText: 'Cancel',
      confirmText: 'Replace',
      isDestructive: true,
      onCancel: closePopup,
      onConfirm: async () => {
        closePopup();
        setImporting(true);
        const result = await pickAndImportData('replace');
        setImporting(false);
        if (result.success) { 
          refreshDebts(); refreshSubs(); refreshCredits(); refreshSpending();
          setTimeout(() => showPopup({
            title: 'Import Successful',
            message: `Replaced with ${result.subscriptionsCount} subs, ${result.creditsCount} lent, ${result.debtsCount} debts, ${result.spendingCount} spending entries.`,
            icon: 'checkmark-circle-outline',
            iconColor: '#66BB6A',
            confirmText: 'Done',
            onConfirm: closePopup,
          }), 400); // Wait for modal exit animation
        } else if (result.error !== 'User cancelled') {
          setTimeout(() => showPopup({
            title: 'Import Failed',
            message: result.error || 'Unknown error',
            icon: 'close-circle-outline',
            iconColor: colors.accent.red,
            confirmText: 'Close',
            onConfirm: closePopup,
          }), 400);
        }
      }
    });
  };

  const handleResetOnboarding = async () => {
    await storage.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'false');
    showPopup({
      title: 'Onboarding Reset',
      message: 'Onboarding slides will be shown next time you open the app.',
      icon: 'refresh-circle-outline',
      iconColor: colors.accent.blue,
      confirmText: 'OK',
      onConfirm: closePopup,
    });
  };

  const handleClearAll = () => {
    showPopup({
      title: 'Clear All Data?',
      message: 'This will permanently delete ALL subscriptions, debts, credits, and spending. This action cannot be undone.',
      icon: 'alert-circle-outline',
      iconColor: colors.accent.red,
      cancelText: 'Cancel',
      confirmText: 'Delete Everything',
      isDestructive: true,
      onCancel: closePopup,
      onConfirm: () => {
        closePopup();
        setTimeout(() => showPopup({
          title: 'Are you sure?',
          message: 'This is your last chance. All data will be lost forever.',
          icon: 'warning-outline',
          iconColor: colors.accent.red,
          cancelText: 'Cancel',
          confirmText: 'Yes, Delete',
          isDestructive: true,
          onCancel: closePopup,
          onConfirm: async () => {
            await clearAllData(); refreshDebts(); refreshSubs(); refreshCredits(); refreshSpending();
            closePopup();
            setTimeout(() => showPopup({
              title: 'Data Cleared',
              message: 'All your data has been successfully deleted.',
              icon: 'trash-outline',
              iconColor: '#66BB6A',
              confirmText: 'Done',
              onConfirm: closePopup,
            }), 400);
          }
        }), 400);
      }
    });
  };

  const handleCurrencySelect = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCurrency(code);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AmbientBackground />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {/* Appearance Section */}
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>Choose your preferred app theme.</Text>
          <View style={styles.themeRow}>
            {['light', 'system', 'dark'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.themeBtn, mode === t && styles.themeBtnActive]}
                onPress={() => setMode(t as any)}
              >
                <Text style={[styles.themeBtnText, mode === t && styles.themeBtnTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Currency Section */}
        <Text style={styles.sectionTitle}>CURRENCY</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>Select your default currency for displaying amounts.</Text>
          <TouchableOpacity
            style={styles.currencySelector}
            onPress={() => setShowCurrencyPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.currencyLeft}>
              <Text style={styles.currencyFlag}>{currency.flag}</Text>
              <View>
                <Text style={styles.currencyCode}>{currency.code}</Text>
                <Text style={styles.currencyName}>{currency.name}</Text>
              </View>
            </View>
            <View style={styles.currencyRight}>
              <Text style={styles.currencySymbol}>{currency.symbol}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>BACKUP & RESTORE</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>Export your data to a JSON file for backup or transfer.</Text>
          <GlassButton title={exporting ? "Exporting..." : "Export Backup"} onPress={handleExport} disabled={exporting} size="large" />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>Import data from a backup file.</Text>
          <View style={styles.importRow}>
            <TouchableOpacity style={styles.importBtn} onPress={handleImportMerge} disabled={importing}>
              {importing ? <ActivityIndicator color={colors.accent.blue} /> : <>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(79,195,247,0.12)' }]}>
                  <Ionicons name="git-merge-outline" size={24} color={colors.accent.blue} />
                </View>
                <View style={styles.importTextWrap}>
                  <Text style={styles.importLabel}>Merge</Text>
                  <Text style={styles.importSub}>Keep existing</Text>
                </View>
              </>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.importBtn, styles.importBtnDanger]} onPress={handleImportReplace} disabled={importing}>
              {importing ? <ActivityIndicator color={colors.accent.red} /> : <>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239,83,80,0.12)' }]}>
                  <Ionicons name="refresh-outline" size={24} color={colors.accent.red} />
                </View>
                <View style={styles.importTextWrap}>
                  <Text style={[styles.importLabel, { color: colors.accent.red }]}>Replace</Text>
                  <Text style={styles.importSub}>Delete existing</Text>
                </View>
              </>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: colors.accent.red }]}>DANGER ZONE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dangerRow} onPress={handleResetOnboarding}>
            <Ionicons name="refresh-circle-outline" size={22} color={colors.accent.red} />
            <Text style={styles.dangerLabel}>Reset Onboarding</Text>
          </TouchableOpacity>
          <Text style={styles.cardDesc}>Show the intro slides again on next app start.</Text>
          
          <View style={{ height: 16 }} />
          
          <TouchableOpacity style={styles.dangerRow} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={22} color={colors.accent.red} />
            <Text style={styles.dangerLabel}>Clear All Data</Text>
          </TouchableOpacity>
          <Text style={styles.cardDesc}>Permanently delete all your tracking data.</Text>
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}><Text style={styles.aboutLabel}>App</Text><Text style={styles.aboutValue}>SubDebt</Text></View>
          <View style={styles.aboutRow}><Text style={styles.aboutLabel}>Version</Text><Text style={styles.aboutValue}>{Constants.expoConfig?.version || '1.0.0'}</Text></View>
          <View style={styles.aboutRow}><Text style={styles.aboutLabel}>Storage</Text><Text style={styles.aboutValue}>Local Device</Text></View>
          <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}><Text style={styles.aboutLabel}>Currency</Text><Text style={styles.aboutValue}>{currency.symbol} {currency.code}</Text></View>
        </View>
        <Text style={styles.footer}>Your data is securely stored locally on this device.</Text>
      </ScrollView>

      <CurrencyPicker
        visible={showCurrencyPicker}
        selectedCode={currency.code}
        onSelect={handleCurrencySelect}
        onClose={() => setShowCurrencyPicker(false)}
      />

      <AppPopup 
        visible={popupVisible}
        title={popupConfig.title}
        message={popupConfig.message}
        icon={popupConfig.icon}
        iconColor={popupConfig.iconColor}
        cancelText={popupConfig.cancelText}
        confirmText={popupConfig.confirmText}
        isDestructive={popupConfig.isDestructive}
        onCancel={popupConfig.onCancel}
        onConfirm={popupConfig.onConfirm}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.glass.card, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: colors.text.primary, fontSize: 13, fontWeight: '700', letterSpacing: 1, marginTop: 24, marginBottom: 12 },
  card: { backgroundColor: isDark ? 'rgba(30, 30, 45, 0.6)' : colors.glass.buttonSecondary, borderWidth: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.glass.navBorder, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardDesc: { color: colors.text.secondary, fontSize: 14, marginBottom: 16, lineHeight: 20 },

  // Currency Selector
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? 'rgba(30, 30, 45, 0.8)' : colors.glass.card,
    borderWidth: 0.5,
    borderColor: colors.glass.cardBorder,
    borderRadius: 14,
    padding: 14,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyFlag: {
    fontSize: 28,
  },
  currencyCode: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  currencyName: {
    color: colors.text.muted,
    fontSize: 13,
    marginTop: 2,
  },
  currencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencySymbol: {
    color: colors.accent.blue,
    fontSize: 22,
    fontWeight: '700',
  },

  importRow: { flexDirection: 'row', gap: 12 },
  importBtn: { flex: 1, backgroundColor: isDark ? 'rgba(30, 30, 45, 0.8)' : colors.glass.card, borderWidth: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.glass.cardBorder, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center' },
  importBtnDanger: { borderColor: 'rgba(239,83,80,0.2)' },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  importTextWrap: { alignItems: 'center' },
  importLabel: { color: colors.accent.blue, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  importSub: { color: colors.text.muted, fontSize: 12, textAlign: 'center' },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dangerLabel: { color: colors.accent.red, fontSize: 16, fontWeight: '600' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.glass.inputBorder },
  aboutLabel: { color: colors.text.secondary, fontSize: 15, flex: 1 },
  aboutValue: { color: colors.text.primary, fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'right' },
  footer: { color: colors.text.tertiary, fontSize: 13, textAlign: 'center', marginTop: 32, marginBottom: 20 },

  themeRow: {
    flexDirection: 'row',
    backgroundColor: colors.glass.input,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.glass.inputBorder,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  themeBtnActive: {
    backgroundColor: colors.glass.cardBorder,
  },
  themeBtnText: {
    color: colors.text.muted,
    fontWeight: '600',
    fontSize: 14,
  },
  themeBtnTextActive: {
    color: colors.text.primary,
  },
});
