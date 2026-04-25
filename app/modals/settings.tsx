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
import { exportAllData } from '../../utils/exportData';
import { pickAndImportData, clearAllData } from '../../utils/importData';
import { useDebts } from '../../hooks/useDebts';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { colors } from '../../constants/colors';

export default function SettingsModal() {
  const router = useRouter();
  const { refresh: refreshDebts } = useDebts();
  const { refresh: refreshSubs } = useSubscriptions();
  
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

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
      refreshDebts(); refreshSubs(); 
      showPopup({
        title: 'Import Successful',
        message: `Merged ${result.subscriptionsCount} subscriptions and ${result.debtsCount} debts.`,
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
          refreshDebts(); refreshSubs(); 
          setTimeout(() => showPopup({
            title: 'Import Successful',
            message: `Replaced with ${result.subscriptionsCount} subs and ${result.debtsCount} debts.`,
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

  const handleClearAll = () => {
    showPopup({
      title: 'Clear All Data?',
      message: 'This will permanently delete ALL subscriptions and debts. This action cannot be undone.',
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
          onConfirm: () => {
            clearAllData(); refreshDebts(); refreshSubs();
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

        <Text style={styles.sectionTitle}>DANGER ZONE</Text>
        <View style={[styles.card, { borderColor: 'rgba(239,83,80,0.2)' }]}>
          <View style={styles.dangerRow}>
            <Ionicons name="warning-outline" size={20} color={colors.accent.red} />
            <Text style={styles.dangerLabel}>Clear All Data</Text>
          </View>
          <Text style={styles.cardDesc}>Permanently delete all subscriptions and debts.</Text>
          <GlassButton title="Clear All Data" variant="danger" onPress={handleClearAll} size="large" />
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}><Text style={styles.aboutLabel}>App</Text><Text style={styles.aboutValue}>SubDebt</Text></View>
          <View style={styles.aboutRow}><Text style={styles.aboutLabel}>Version</Text><Text style={styles.aboutValue}>1.0.0</Text></View>
          <View style={styles.aboutRow}><Text style={styles.aboutLabel}>Storage</Text><Text style={styles.aboutValue}>Local Device</Text></View>
          <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}><Text style={styles.aboutLabel}>Currency</Text><Text style={styles.aboutValue}>₹ INR</Text></View>
        </View>
        <Text style={styles.footer}>Your data is securely stored locally on this device.</Text>
      </ScrollView>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0c14' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: '#ffffff', fontSize: 13, fontWeight: '700', letterSpacing: 1, marginTop: 24, marginBottom: 12 },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 16, lineHeight: 20 },
  importRow: { flexDirection: 'row', gap: 12 },
  importBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center' },
  importBtnDanger: { borderColor: 'rgba(239,83,80,0.2)' },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  importTextWrap: { alignItems: 'center' },
  importLabel: { color: colors.accent.blue, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  importSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dangerLabel: { color: colors.accent.red, fontSize: 16, fontWeight: '600' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  aboutLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 15, flex: 1 },
  aboutValue: { color: '#ffffff', fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'right' },
  footer: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginTop: 32, marginBottom: 20 },
});
