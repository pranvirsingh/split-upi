import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { buildUpiUri } from './lib/upi';
import { formatINR } from './lib/format';
import { decodePayView, type PayViewState } from './lib/payview';

const PANEL = '#121a15';
const NIGHT = '#0c1210';
const MIST = '#ece7d9';
const FAINT = '#9aa39b';
const GOLD = '#d3a62c';

export default function Checklist() {
  const [raw, setRaw] = useState('');
  const [state, setState] = useState<PayViewState | null>(null);
  const [ticked, setTicked] = useState<Set<number>>(new Set());

  const open = () => {
    const s = decodePayView(raw.trim());
    if (!s) {
      Alert.alert('SplitUPI', 'That link looks broken. Paste a full payer link.');
      return;
    }
    setState(s);
    setTicked(new Set());
  };

  const toggle = (i: number) => {
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const pay = async (uri: string) => {
    try {
      if (!(await Linking.canOpenURL(uri))) {
        Alert.alert('SplitUPI', 'No UPI app found on this device.');
        return;
      }
      await Linking.openURL(uri);
    } catch {
      Alert.alert('SplitUPI', 'Could not open UPI app.');
    }
  };

  if (!state) {
    return (
      <View style={styles.card}>
        <Text style={styles.paneTitle}>$ payer checklist</Text>
        <Text style={styles.hint}>Paste a payer link, tick parts as you pay.</Text>
        <TextInput
          style={styles.input}
          placeholder="https://…#p=…"
          placeholderTextColor="#5c665f"
          autoCapitalize="none"
          autoCorrect={false}
          value={raw}
          onChangeText={setRaw}
        />
        <Pressable style={styles.go} onPress={open}>
          <Text style={styles.goTx}>$ open checklist</Text>
        </Pressable>
      </View>
    );
  }

  const total = state.parts.reduce((a, p) => a + p, 0);
  return (
    <View style={styles.card}>
      <Text style={styles.paneTitle}>
        $ {ticked.size}/{state.parts.length} ticked · Rs.{formatINR(total)}
      </Text>
      <Text style={styles.to}>
        to {state.pn} ({state.pa}){state.tn ? ` · ${state.tn}` : ''}
      </Text>
      {state.parts.map((amount, i) => {
        const done = ticked.has(i);
        const uri = buildUpiUri({ upiId: state.pa, receiverName: state.pn, amount, note: state.tn });
        return (
          <View key={i} style={[styles.row, done && styles.rowDone]}>
            <Pressable onPress={() => toggle(i)} style={[styles.box, done && styles.boxDone]}>
              <Text style={styles.boxTx}>{done ? '✓' : ''}</Text>
            </Pressable>
            <View style={styles.mid}>
              <Text style={[styles.amt, done && styles.struck]}>Rs.{formatINR(amount)}</Text>
              <Text style={styles.part}>part {i + 1} of {state.parts.length}</Text>
            </View>
            <Pressable style={styles.pay} onPress={() => pay(uri)}>
              <Text style={styles.payTx}>Pay</Text>
            </Pressable>
          </View>
        );
      })}
      <Text style={styles.warn}>Ticks are yours to track — verify in your bank/UPI app.</Text>
      <Pressable style={styles.back} onPress={() => setState(null)}>
        <Text style={styles.backTx}>← paste another link</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: PANEL, borderRadius: 14, borderWidth: 1, borderColor: '#ffffff1a', padding: 14, marginBottom: 14 },
  paneTitle: { color: GOLD, fontSize: 11, fontFamily: 'monospace', marginBottom: 10 },
  hint: { color: FAINT, fontSize: 12, fontFamily: 'monospace', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ffffff1a', borderRadius: 8, backgroundColor: NIGHT, color: MIST, fontFamily: 'monospace', fontSize: 13, paddingHorizontal: 12, paddingVertical: 10 },
  go: { backgroundColor: GOLD, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  goTx: { color: NIGHT, fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
  to: { color: FAINT, fontSize: 11, fontFamily: 'monospace', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ffffff1a', borderRadius: 10, backgroundColor: NIGHT, padding: 10, marginBottom: 8 },
  rowDone: { borderColor: '#34d39966', backgroundColor: '#34d3990d' },
  box: { width: 26, height: 26, borderRadius: 7, borderWidth: 1, borderColor: '#ffffff33', alignItems: 'center', justifyContent: 'center' },
  boxDone: { backgroundColor: '#34d399', borderColor: '#34d399' },
  boxTx: { color: NIGHT, fontSize: 14, fontWeight: 'bold' },
  mid: { flex: 1, marginLeft: 10 },
  amt: { color: MIST, fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace' },
  struck: { color: FAINT, textDecorationLine: 'line-through' },
  part: { color: FAINT, fontSize: 10, fontFamily: 'monospace' },
  pay: { backgroundColor: GOLD, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 18 },
  payTx: { color: NIGHT, fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  warn: { color: FAINT, fontSize: 10, fontFamily: 'monospace', marginTop: 6, lineHeight: 14 },
  back: { marginTop: 10, alignSelf: 'flex-start' },
  backTx: { color: GOLD, fontSize: 12, fontFamily: 'monospace' },
});
