import { useTheme } from '../hooks/useTheme';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GlassBadge } from './GlassBadge';
import { Credit } from '../hooks/useCredits';
import { formatCurrency, formatDate, getDaysRemaining, isExpired } from '../utils/dateHelpers';

interface CreditCardProps {
  credit: Credit;
  onMarkReturned?: (id: string) => void;
  onPress?: (id: string) => void;
  onDelete?: () => void;
}

export const CreditCard: React.FC<CreditCardProps> = ({ credit, onMarkReturned, onPress, onDelete }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const overdue = credit.expectedReturnDate ? isExpired(credit.expectedReturnDate) && !credit.isReturned : false;
  const daysRemaining = credit.expectedReturnDate ? getDaysRemaining(credit.expectedReturnDate) : null;

  return (
    <TouchableOpacity onPress={() => onPress?.(credit.id)} activeOpacity={0.85} style={[styles.card, credit.isReturned && styles.cardReturned]}>
      <View style={styles.topRow}>
        <View style={styles.personRow}>
          <View style={[styles.avatar, credit.isReturned && { opacity: 0.6 }]}>
            <Text style={styles.avatarText}>{credit.personName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={[styles.personName, credit.isReturned && styles.strike]}>{credit.personName}</Text>
            {credit.phoneNumber && <Text style={styles.phone}>{credit.phoneNumber}</Text>}
          </View>
        </View>

        <View style={styles.amountWrap}>
          <Text style={[styles.amount, credit.isReturned ? styles.amountReturned : styles.amountPending, credit.isReturned && styles.strike]}>
            {formatCurrency(credit.amount, credit.currency)}
          </Text>
          <View style={styles.badgeRow}>
            <GlassBadge variant={credit.isReturned ? 'paid' : 'active'} />
            {onDelete && (
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDelete(); }} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <Ionicons name="trash-outline" size={17} color={colors.accent.red} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {(credit.purpose || credit.notes) && (
        <View style={styles.middleSection}>
          {credit.purpose && <Text style={styles.purpose} numberOfLines={1}>{credit.purpose}</Text>}
          {credit.notes && <Text style={styles.notes} numberOfLines={2}>{credit.notes}</Text>}
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.datesCol}>
          <View style={styles.dateRow}>
            <Ionicons name="cash-outline" size={14} color={colors.text.muted} />
            <Text style={styles.dateText}>Given: {formatDate(credit.lentDate)}</Text>
          </View>
          {credit.expectedReturnDate && (
            <View style={styles.dateRow}>
              <Ionicons name={overdue ? "alert-circle" : "time-outline"} size={14} color={overdue ? colors.accent.red : colors.text.muted} />
              <Text style={[styles.dateText, overdue && { color: colors.accent.red }]}>
                Expected: {formatDate(credit.expectedReturnDate)}{overdue && ` (${Math.abs(daysRemaining || 0)}d overdue)`}
              </Text>
            </View>
          )}
          {credit.isReturned && credit.returnedDate && (
            <View style={styles.dateRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.accent.green} />
              <Text style={[styles.dateText, { color: colors.accent.green }]}>Returned: {formatDate(credit.returnedDate)}</Text>
            </View>
          )}
        </View>

        {!credit.isReturned && onMarkReturned && (
          <TouchableOpacity style={styles.markBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onMarkReturned(credit.id); }}>
            <Ionicons name="checkmark-circle" size={20} color={colors.accent.green} />
            <Text style={styles.markText}>Mark Returned</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    marginHorizontal: 20, marginBottom: 12, padding: 16,
    borderRadius: 20, backgroundColor: colors.glass.card,
    borderWidth: 0.5, borderColor: colors.glass.cardBorder,
  },
  cardReturned: { opacity: 0.65 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  personRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(102,187,106,0.15)', borderWidth: 1, borderColor: 'rgba(102,187,106,0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.accent.green, fontSize: 18, fontWeight: '700' },
  personInfo: { marginLeft: 12, flex: 1 },
  personName: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
  phone: { color: colors.text.muted, fontSize: 12, marginTop: 2 },
  amountWrap: { alignItems: 'flex-end' },
  amount: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  amountPending: { color: colors.accent.green },
  amountReturned: { color: colors.text.muted },
  strike: { textDecorationLine: 'line-through', color: colors.text.muted },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10, alignSelf: 'flex-end' },
  middleSection: { marginTop: 16 },
  purpose: { color: colors.text.primary, fontSize: 14, fontWeight: '500', marginBottom: 4 },
  notes: { color: colors.text.muted, fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  divider: { height: 1, backgroundColor: colors.glass.card, marginVertical: 14 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  datesCol: { gap: 6, flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { color: colors.text.secondary, fontSize: 13, fontWeight: '500' },
  markBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14, 
    backgroundColor: 'rgba(102,187,106,0.1)', borderRadius: 16, 
    borderWidth: 1, borderColor: 'rgba(102,187,106,0.3)' 
  },
  markText: { color: colors.accent.green, fontSize: 13, fontWeight: '700' },
});
