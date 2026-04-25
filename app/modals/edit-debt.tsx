import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassInput } from '../../components/GlassInput';
import { GlassButton } from '../../components/GlassButton';
import { AppPopup } from '../../components/AppPopup';
import { AmbientBackground } from '../../components/AmbientBackground';
import { useDebts } from '../../hooks/useDebts';
import { colors } from '../../constants/colors';

export default function EditDebtModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateDebt, deleteDebt, getDebtById } = useDebts();
  const debt = getDebtById(id);
  
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [takenDate, setTakenDate] = useState(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showTakenPicker, setShowTakenPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if (debt) {
      setPersonName(debt.personName); setPhoneNumber(debt.phoneNumber || '');
      setAmount(debt.amount.toString()); setCurrency(debt.currency);
      setPurpose(debt.purpose || ''); setNotes(debt.notes || '');
      setIsPaid(debt.isPaid); setTakenDate(new Date(debt.takenDate));
      if (debt.dueDate) { setDueDate(new Date(debt.dueDate)); setHasDueDate(true); }
    }
  }, [debt]);

  if (!debt) {
    return (
      <SafeAreaView style={styles.container}>
        <AmbientBackground />
        <View style={styles.center}>
          <Text style={styles.notFound}>Debt not found</Text>
          <GlassButton title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!personName.trim()) e.personName = 'Person name is required';
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Valid amount is required';
    if (dueDate && dueDate < takenDate) e.dueDate = 'Due date must be after recorded date';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateDebt(id, {
      personName: personName.trim(), phoneNumber: phoneNumber.trim() || undefined,
      amount: Number(amount), currency, purpose: purpose.trim() || undefined,
      takenDate: takenDate.toISOString(), dueDate: dueDate?.toISOString(),
      notes: notes.trim() || undefined, isPaid,
    });
    router.back();
  };

  const handleDelete = () => {
    setPopupVisible(true);
  };

  const confirmDelete = () => {
    setPopupVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteDebt(id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AmbientBackground />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Debt</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={22} color={colors.accent.red} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.statusRow}>
            <Text style={styles.fieldLabel}>Payment Status</Text>
            <TouchableOpacity style={[styles.statusPill, isPaid && styles.statusActive]} onPress={() => setIsPaid(!isPaid)}>
              <Text style={[styles.statusText, isPaid && styles.statusTextActive]}>{isPaid ? 'Paid' : 'Pending'}</Text>
            </TouchableOpacity>
          </View>
          <GlassInput label="Person Name" placeholder="Who do you need to pay?" value={personName} onChangeText={setPersonName} error={errors.personName} />
          <GlassInput label="Phone (Optional)" placeholder="Contact number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
          <View style={styles.row}>
            <View style={styles.amountCol}><GlassInput label="Amount" placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" error={errors.amount} /></View>
            <View style={styles.currBox}><Text style={styles.fieldLabel}>Currency</Text>
              <View style={styles.currPill}><Text style={styles.currText}>{currency}</Text></View>
            </View>
          </View>
          <GlassInput label="Purpose (Optional)" placeholder="What is this for?" value={purpose} onChangeText={setPurpose} />
          <Text style={styles.sectionLabel}>Dates</Text>
          <TouchableOpacity style={styles.dateRow} onPress={() => setShowTakenPicker(true)}>
            <Ionicons name="calendar-outline" size={18} color={colors.accent.amber} />
            <Text style={styles.dateLabel}>Date Recorded</Text>
            <Text style={styles.dateValue}>{takenDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <View style={styles.dueToggle}>
            <Text style={styles.dateLabel}>Set Due Date</Text>
            <TouchableOpacity onPress={() => { setHasDueDate(!hasDueDate); if (!hasDueDate) setDueDate(new Date(Date.now()+30*86400000)); else setDueDate(null); }}>
              <Ionicons name={hasDueDate ? "checkbox" : "square-outline"} size={24} color={hasDueDate ? colors.accent.amber : colors.text.muted} />
            </TouchableOpacity>
          </View>
          {hasDueDate && (
            <TouchableOpacity style={[styles.dateRow, errors.dueDate && {borderColor: colors.accent.red}]} onPress={() => setShowDuePicker(true)}>
              <Ionicons name="calendar-outline" size={18} color={colors.accent.amber} />
              <Text style={styles.dateLabel}>Due Date</Text>
              <Text style={styles.dateValue}>{dueDate?.toLocaleDateString() || 'Select'}</Text>
            </TouchableOpacity>
          )}
          {errors.dueDate && <Text style={styles.err}>{errors.dueDate}</Text>}
          <GlassInput label="Notes (Optional)" placeholder="Additional details..." value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
          <View style={styles.btns}>
            <GlassButton title="Save Changes" onPress={handleSave} size="large" />
            <GlassButton title="Cancel" variant="ghost" onPress={() => router.back()} size="large" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DateTimePickerModal isVisible={showTakenPicker} mode="date" themeVariant="dark" onConfirm={(d) => { setShowTakenPicker(false); setTakenDate(d); }} onCancel={() => setShowTakenPicker(false)} date={takenDate} />
      <DateTimePickerModal isVisible={showDuePicker} mode="date" themeVariant="dark" onConfirm={(d) => { setShowDuePicker(false); setDueDate(d); }} onCancel={() => setShowDuePicker(false)} date={dueDate || new Date()} minimumDate={takenDate} />

      <AppPopup 
        visible={popupVisible}
        title="Delete Debt"
        message={`Are you sure you want to delete this debt for ${debt.personName}?`}
        icon="trash-outline"
        iconColor={colors.accent.red}
        cancelText="Cancel"
        confirmText="Delete"
        isDestructive={true}
        onCancel={() => setPopupVisible(false)}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0c14' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  notFound: { color: colors.text.secondary, fontSize: 18, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(239,83,80,0.1)', justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.text.primary, fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  fieldLabel: { color: colors.text.secondary, fontSize: 13, marginBottom: 8, fontWeight: '500' },
  statusPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  statusActive: { backgroundColor: 'rgba(102,187,106,0.15)', borderColor: 'rgba(102,187,106,0.4)' },
  statusText: { color: colors.text.muted, fontSize: 13, fontWeight: '500' },
  statusTextActive: { color: '#66BB6A', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  amountCol: { flex: 1 },
  currBox: { width: 90, marginBottom: 14 },
  currPill: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, height: 48 },
  currText: { color: colors.text.primary, fontSize: 15 },
  sectionLabel: { color: colors.text.secondary, fontSize: 13, marginBottom: 10, marginTop: 16, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8 },
  dueToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8 },
  dateLabel: { color: colors.text.secondary, fontSize: 14, flex: 1 },
  dateValue: { color: colors.text.primary, fontSize: 14, fontWeight: '600' },
  err: { color: colors.accent.red, fontSize: 12, marginTop: -4, marginBottom: 8 },
  btns: { gap: 10, marginTop: 24 },
});
