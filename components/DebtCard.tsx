import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GlassBadge } from './GlassBadge';
import { Debt } from '../hooks/useDebts';
import { colors } from '../constants/colors';
import { formatCurrency, formatDate, getDaysRemaining, isExpired } from '../utils/dateHelpers';

interface DebtCardProps {
  debt: Debt;
  onTogglePaid?: (id: string) => void;
  onPress?: (id: string) => void;
  onDelete?: () => void;
}

export const DebtCard: React.FC<DebtCardProps> = ({ debt, onTogglePaid, onPress, onDelete }) => {
  const overdue = debt.dueDate ? isExpired(debt.dueDate) && !debt.isPaid : false;
  const daysRemaining = debt.dueDate ? getDaysRemaining(debt.dueDate) : null;

  return (
    <TouchableOpacity onPress={() => onPress?.(debt.id)} activeOpacity={0.85} style={[styles.card, debt.isPaid && styles.cardPaid]}>
      {/* Top Section */}
      <View style={styles.topRow}>
        <View style={styles.personRow}>
          <View style={[styles.avatar, debt.isPaid && { opacity: 0.6 }]}>
            <Text style={styles.avatarText}>{debt.personName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={[styles.personName, debt.isPaid && styles.strike]}>{debt.personName}</Text>
            {debt.phoneNumber && <Text style={styles.phone}>{debt.phoneNumber}</Text>}
          </View>
        </View>

        <View style={styles.amountWrap}>
          <Text style={[styles.amount, debt.isPaid ? styles.amountPaid : styles.amountPending, debt.isPaid && styles.strike]}>
            {formatCurrency(debt.amount, debt.currency)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10, alignSelf: 'flex-end' }}>
            <GlassBadge variant={debt.isPaid ? 'paid' : 'pending'} />
            {onDelete && (
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDelete(); }} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <Ionicons name="trash-outline" size={17} color={colors.accent.red} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Middle Section - Purpose & Notes */}
      {(debt.purpose || debt.notes) && (
        <View style={styles.middleSection}>
          {debt.purpose && <Text style={styles.purpose} numberOfLines={1}>{debt.purpose}</Text>}
          {debt.notes && <Text style={styles.notes} numberOfLines={2}>{debt.notes}</Text>}
        </View>
      )}

      <View style={styles.divider} />

      {/* Bottom Section - Dates & Actions */}
      <View style={styles.bottomRow}>
        <View style={styles.datesCol}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
            <Text style={styles.dateText}>Recorded: {formatDate(debt.takenDate)}</Text>
          </View>
          {debt.dueDate && (
            <View style={styles.dateRow}>
              <Ionicons name={overdue ? "alert-circle" : "time-outline"} size={14} color={overdue ? colors.accent.red : colors.text.muted} />
              <Text style={[styles.dateText, overdue && { color: colors.accent.red }]}>
                Due: {formatDate(debt.dueDate)}{overdue && ` (${Math.abs(daysRemaining || 0)}d overdue)`}
              </Text>
            </View>
          )}
          {debt.isPaid && debt.paidDate && (
            <View style={styles.dateRow}>
              <Ionicons name="checkmark-circle" size={14} color="#66BB6A" />
              <Text style={[styles.dateText, { color: '#66BB6A' }]}>Paid: {formatDate(debt.paidDate)}</Text>
            </View>
          )}
        </View>

        {!debt.isPaid && onTogglePaid && (
          <TouchableOpacity style={styles.markBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onTogglePaid(debt.id); }}>
            <Ionicons name="checkmark-circle" size={20} color="#66BB6A" />
            <Text style={styles.markText}>Mark Paid</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20, marginBottom: 12, padding: 16,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  cardPaid: { opacity: 0.65 },
  
  // Top Row
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  personRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 183, 77, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 183, 77, 0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.accent.amber, fontSize: 18, fontWeight: '700' },
  personInfo: { marginLeft: 12, flex: 1 },
  personName: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
  phone: { color: colors.text.muted, fontSize: 12, marginTop: 2 },
  amountWrap: { alignItems: 'flex-end' },
  amount: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  amountPending: { color: colors.accent.amber },
  amountPaid: { color: '#66BB6A' },
  strike: { textDecorationLine: 'line-through', color: colors.text.muted },

  // Middle
  middleSection: { marginTop: 16 },
  purpose: { color: colors.text.primary, fontSize: 14, fontWeight: '500', marginBottom: 4 },
  notes: { color: colors.text.muted, fontSize: 13, fontStyle: 'italic', lineHeight: 18 },

  // Divider
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 14 },

  // Bottom Row
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  datesCol: { gap: 6, flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500' },
  
  // Action Button
  markBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14, 
    backgroundColor: 'rgba(102,187,106,0.1)', borderRadius: 16, 
    borderWidth: 1, borderColor: 'rgba(102,187,106,0.3)' 
  },
  markText: { color: '#66BB6A', fontSize: 13, fontWeight: '700' },
});
