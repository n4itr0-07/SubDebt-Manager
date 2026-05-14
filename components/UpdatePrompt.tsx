import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { UpdateInfo, skipVersion, openDownloadUrl } from '../utils/updateChecker';

const { width } = Dimensions.get('window');

interface UpdatePromptProps {
  visible: boolean;
  updateInfo: UpdateInfo;
  onDismiss: () => void;
}

export const UpdatePrompt: React.FC<UpdatePromptProps> = ({
  visible,
  updateInfo,
  onDismiss,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const handleUpdate = () => {
    openDownloadUrl(updateInfo.downloadUrl);
    onDismiss();
  };

  const handleSkip = async () => {
    await skipVersion(updateInfo.latestVersion);
    onDismiss();
  };

  const formattedDate = updateInfo.publishedAt
    ? new Date(updateInfo.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  const bulletPoints = (updateInfo.releaseNotes || '')
    .split('\n')
    .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map((line) => line.replace(/^[\s\-\*]+/, '').replace(/\*\*/g, '').trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="rocket-outline" size={28} color={colors.accent.purple} />
          </View>

          <Text style={styles.title}>Update Available</Text>
          <View style={styles.versionRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionLabel}>v{updateInfo.currentVersion}</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
            <View style={[styles.versionBadge, styles.versionBadgeNew]}>
              <Text style={[styles.versionLabel, styles.versionLabelNew]}>
                v{updateInfo.latestVersion}
              </Text>
            </View>
          </View>

          {formattedDate ? (
            <Text style={styles.dateText}>Released {formattedDate}</Text>
          ) : null}

          {bulletPoints.length > 0 && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>What's New</Text>
              {bulletPoints.map((point, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={styles.updateBtnText}>Download Update</Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity onPress={onDismiss} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Later</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSkip} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Skip This Version</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    card: {
      width: width - 48,
      maxWidth: 380,
      backgroundColor: isDark ? '#141420' : '#ffffff',
      borderRadius: 28,
      padding: 28,
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: colors.glass.cardBorder,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      color: colors.text.primary,
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.3,
      marginBottom: 12,
    },
    versionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    versionBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    },
    versionBadgeNew: {
      backgroundColor: isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.1)',
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(124,58,237,0.35)' : 'rgba(124,58,237,0.25)',
    },
    versionLabel: {
      color: colors.text.secondary,
      fontSize: 13,
      fontWeight: '600',
    },
    versionLabelNew: {
      color: colors.accent.purple,
      fontWeight: '700',
    },
    dateText: {
      color: colors.text.secondary,
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 16,
    },
    notesContainer: {
      width: '100%',
      backgroundColor: colors.glass.buttonSecondary,
      borderRadius: 16,
      padding: 14,
      marginBottom: 20,
    },
    notesTitle: {
      color: colors.text.tertiary,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    bulletDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.accent.purple,
      marginTop: 6,
      marginRight: 10,
    },
    bulletText: {
      color: colors.text.secondary,
      fontSize: 13,
      fontWeight: '500',
      flex: 1,
      lineHeight: 18,
    },
    updateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: colors.accent.purple,
    },
    updateBtnText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 12,
    },
    secondaryBtn: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    secondaryText: {
      color: colors.text.secondary,
      fontSize: 13,
      fontWeight: '600',
    },
  });
