import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { DEFAULT_MAX_PER_QR, DISCLAIMER_TEXT, PRESETS } from './src/lib/constants';
import { formatINR } from './src/lib/format';
import { buildUpiUri } from './src/lib/upi';
import { validateInputs, type ValidationResult } from './src/lib/validation';

const NIGHT = '#0c1210';
const PANEL = '#121a15';
const MIST = '#ece7d9';
const FAINT = '#9aa39b';
const GOLD = '#d3a62c';
const FOREST = '#173b2e';

function Logo() {
  return (
    <View style={styles.logo}>
      <View style={styles.logoRow}>
        <View style={styles.px} />
        <View style={styles.px} />
      </View>
      <View style={styles.logoRow}>
        <View style={styles.px} />
        <View style={[styles.px, styles.pxGold]} />
      </View>
    </View>
  );
}

interface Gen {
  amount: number;
  uri: string;
}

export default function App() {
  const [upiId, setUpiId] = useState('');
  const [name, setName] = useState('');
  const [total, setTotal] = useState('4500');
  const [maxQr, setMaxQr] = useState(String(DEFAULT_MAX_PER_QR));
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [list, setList] = useState<Gen[] | null>(null);

  const onGenerate = () => {
    const v = validateInputs({ upiId, receiverName: name, totalAmount: total, maxPerQr: maxQr, note });
    setErrors(v.ok ? {} : v.errors);
    if (!v.ok || !v.parts) {
      setList(null);
      if (v.errors.general) Alert.alert('SplitUPI', v.errors.general);
      return;
    }
    const id = upiId.trim();
    const nm = name.trim();
    const nt = note.trim();
    setList(v.parts.map((amount) => ({ amount, uri: buildUpiUri({ upiId: id, receiverName: nm, amount, note: nt }) })));
  };

  const openUpi = async (uri: string) => {
    try {
      const ok = await Linking.canOpenURL(uri);
      if (!ok) {
        Alert.alert('SplitUPI', 'No UPI app found on this device.');
        return;
      }
      await Linking.openURL(uri);
    } catch {
      Alert.alert('SplitUPI', 'Could not open UPI app.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Logo />
          <View style={styles.headerTx}>
            <Text style={styles.brand}>split<Text style={styles.gold}>upi</Text></Text>
            <Text style={styles.sub}>v1.8 · on-device</Text>
          </View>
          <View style={styles.dot} />
        </View>

        <View style={styles.card}>
          <Text style={styles.paneTitle}>$ input</Text>
          <Text style={styles.label}>&gt; upi_id</Text>
          <TextInput
            style={[styles.input, errors.upiId && styles.inputBad]}
            placeholder="example@upi"
            placeholderTextColor="#5c665f"
            autoCapitalize="none"
            autoCorrect={false}
            value={upiId}
            onChangeText={setUpiId}
          />
          {errors.upiId ? <Text style={styles.err}>! {errors.upiId}</Text> : null}

          <Text style={styles.label}>&gt; receiver</Text>
          <TextInput
            style={[styles.input, errors.receiverName && styles.inputBad]}
            placeholder="Example Name"
            placeholderTextColor="#5c665f"
            value={name}
            onChangeText={setName}
          />
          {errors.receiverName ? <Text style={styles.err}>! {errors.receiverName}</Text> : null}

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>&gt; total Rs.</Text>
              <TextInput
                style={[styles.input, errors.totalAmount && styles.inputBad]}
                placeholder="4500"
                placeholderTextColor="#5c665f"
                keyboardType="decimal-pad"
                value={total}
                onChangeText={setTotal}
              />
              {errors.totalAmount ? <Text style={styles.err}>! {errors.totalAmount}</Text> : null}
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>&gt; max/qr Rs.</Text>
              <TextInput
                style={[styles.input, errors.maxPerQr && styles.inputBad]}
                placeholder="1999"
                placeholderTextColor="#5c665f"
                keyboardType="decimal-pad"
                value={maxQr}
                onChangeText={setMaxQr}
              />
              {errors.maxPerQr ? <Text style={styles.err}>! {errors.maxPerQr}</Text> : null}
            </View>
          </View>

          <View style={styles.presets}>
            {(PRESETS as readonly number[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => setMaxQr(String(p))}
                style={[styles.pill, maxQr === String(p) && styles.pillOn]}
              >
                <Text style={[styles.pillTx, maxQr === String(p) && styles.pillTxOn]}>{p}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>&gt; note?</Text>
          <TextInput
            style={styles.input}
            placeholder="Invoice 001"
            placeholderTextColor="#5c665f"
            value={note}
            onChangeText={setNote}
          />

          <Pressable style={styles.go} onPress={onGenerate}>
            <Text style={styles.goTx}>$ generate_qr</Text>
          </Pressable>
        </View>

        {list ? (
          <View style={styles.card}>
            <Text style={styles.paneTitle}>
              $ output — {list.length} pkts · Rs.{formatINR(list.reduce((a, g) => a + g.amount, 0))}
            </Text>
            {list.map((g, i) => (
              <View key={`${g.amount}-${i}`} style={styles.pkt}>
                <Text style={styles.pktTitle}>
                  pkt_{i + 1}/{list.length} · Rs.{formatINR(g.amount)}
                </Text>
                <View style={styles.qrBox}>
                  <QRCode value={g.uri} size={200} color="#1c1813" backgroundColor="#ffffff" />
                </View>
                <Pressable style={styles.open} onPress={() => openUpi(g.uri)}>
                  <Text style={styles.openTx}>open in upi app</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.fine}>{DISCLAIMER_TEXT}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NIGHT },
  body: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  logo: { width: 34, height: 34, borderRadius: 9, backgroundColor: FOREST, alignItems: 'center', justifyContent: 'center' },
  logoRow: { flexDirection: 'row' },
  px: { width: 8, height: 8, borderRadius: 2, backgroundColor: MIST, margin: 1.5 },
  pxGold: { backgroundColor: GOLD, marginLeft: 3, marginTop: 3 },
  headerTx: { flex: 1, marginLeft: 10 },
  brand: { color: MIST, fontSize: 17, fontWeight: 'bold', fontFamily: 'monospace' },
  gold: { color: GOLD },
  sub: { color: FAINT, fontSize: 10, fontFamily: 'monospace' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34d399' },
  card: { backgroundColor: PANEL, borderRadius: 14, borderWidth: 1, borderColor: '#ffffff1a', padding: 14, marginBottom: 14 },
  paneTitle: { color: GOLD, fontSize: 11, fontFamily: 'monospace', marginBottom: 10 },
  label: { color: FAINT, fontSize: 11, fontFamily: 'monospace', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ffffff1a', borderRadius: 8, backgroundColor: NIGHT, color: MIST, fontFamily: 'monospace', fontSize: 14, paddingHorizontal: 12, paddingVertical: 10 },
  inputBad: { borderColor: '#f43f5e99' },
  err: { color: '#fda4af', fontSize: 12, fontFamily: 'monospace', marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  presets: { flexDirection: 'row', gap: 6, marginTop: 10 },
  pill: { borderWidth: 1, borderColor: '#ffffff1a', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  pillOn: { backgroundColor: GOLD, borderColor: GOLD },
  pillTx: { color: FAINT, fontSize: 12, fontFamily: 'monospace' },
  pillTxOn: { color: NIGHT, fontWeight: 'bold' },
  go: { backgroundColor: GOLD, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  goTx: { color: NIGHT, fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace' },
  pkt: { borderWidth: 1, borderColor: '#ffffff1a', borderRadius: 10, backgroundColor: NIGHT, padding: 12, marginBottom: 10, alignItems: 'center' },
  pktTitle: { color: GOLD, fontSize: 11, fontFamily: 'monospace', marginBottom: 8 },
  qrBox: { backgroundColor: '#fff', borderRadius: 8, padding: 10 },
  open: { marginTop: 10, backgroundColor: '#1d4d3b', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  openTx: { color: '#6ee7b7', fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  fine: { color: FAINT, fontSize: 10, lineHeight: 15, marginTop: 4 },
});
