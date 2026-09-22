import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  PermissionsAndroid,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import QRCode from 'react-native-qrcode-svg';
import { version as APP_VERSION } from './package.json';
import { DEFAULT_MAX_PER_QR, DISCLAIMER_TEXT, PRESETS, SITE_URL } from './src/lib/constants';
import { formatINR } from './src/lib/format';
import { splitAmount } from './src/lib/split';
import { buildUpiUri } from './src/lib/upi';
import { validateInputs, type ValidationResult } from './src/lib/validation';
import {
  deleteFrom,
  getDefault,
  parseProfiles,
  previewLine,
  saveProfileTo,
  serializeProfiles,
  suggestMaxForFewParts,
  type ReceiverProfile,
} from './src/lib/profiles';
import { payViewUrl } from './src/lib/payview';
import { checkForUpdate, type UpdateInfo } from './src/lib/update';
import Checklist from './src/Checklist';

const NIGHT = '#0c1210';
const PANEL = '#121a15';
const MIST = '#ece7d9';
const FAINT = '#9aa39b';
const GOLD = '#d3a62c';
const FOREST = '#173b2e';
const PROFILES_KEY = 'splitupi.profiles.v1';

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

interface QrHandle {
  toDataURL: (cb: (base64: string) => void) => void;
}

export default function App() {
  const [upiId, setUpiId] = useState('');
  const [name, setName] = useState('');
  const [total, setTotal] = useState('4500');
  const [maxQr, setMaxQr] = useState(String(DEFAULT_MAX_PER_QR));
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [list, setList] = useState<Gen[] | null>(null);
  const [profiles, setProfiles] = useState<ReceiverProfile[]>([]);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [tab, setTab] = useState<'gen' | 'pay'>('gen');
  const qrRefs = useRef<Record<number, QrHandle | null>>({});

  useEffect(() => {
    AsyncStorage.getItem(PROFILES_KEY)
      .then((raw) => {
        const all = parseProfiles(raw);
        setProfiles(all);
        const d = getDefault(all);
        if (d) {
          setUpiId(d.upiId);
          setName(d.name);
          setMaxQr(d.maxPerQr);
          setNote(d.note);
        }
      })
      .catch(() => {});
    checkForUpdate().then(setUpdate).catch(() => {});
  }, []);

  const persist = (next: ReceiverProfile[]) => {
    setProfiles(next);
    AsyncStorage.setItem(PROFILES_KEY, serializeProfiles(next)).catch(() => {});
  };

  // Live preview (quiet, guarded like web).
  const t = Number(total.replace(/,/g, ''));
  const m = Number(maxQr.replace(/,/g, ''));
  const pv =
    Number.isFinite(t) && Number.isFinite(m) && t > 0 && m >= 1 && t <= 1000000
      ? (() => {
          const v = validateInputs({ upiId, receiverName: name, totalAmount: total, maxPerQr: maxQr, note });
          if (!v.ok || !v.parts || v.total === undefined || v.max === undefined) return null;
          let suggestion: { max: number; parts: number[] } | null = null;
          if (v.parts.length >= 5) {
            const sm = suggestMaxForFewParts(v.total);
            if (sm > v.max) {
              try {
                const sp = splitAmount(v.total, sm);
                if (sp.length < v.parts.length) suggestion = { max: sm, parts: sp };
              } catch {
                /* ignore */
              }
            }
          }
          return { parts: v.parts, suggestion };
        })()
      : null;

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

  const onSaveProfile = () => {
    if (!upiId.includes('@') || name.trim().length < 2) {
      Alert.alert('SplitUPI', 'Need a valid UPI ID + name to save.');
      return;
    }
    persist(saveProfileTo(profiles, { upiId, name, maxPerQr: maxQr, note }));
  };

  const applyProfile = (p: ReceiverProfile) => {
    setUpiId(p.upiId);
    setName(p.name);
    setMaxQr(p.maxPerQr);
    setNote(p.note);
    setList(null);
  };

  const payerLink = (parts: number[]) =>
    payViewUrl({ v: 1, pa: upiId.trim(), pn: name.trim(), tn: note.trim(), parts }, SITE_URL);

  const sharePart = async (g: Gen, i: number, n: number) => {
    try {
      await Share.share({
        title: `SplitUPI ${i + 1}/${n}`,
        message: `Pay Rs.${formatINR(g.amount)} to ${name.trim()}: ${payerLink([g.amount])}`,
      });
    } catch {
      /* dismissed */
    }
  };

  const hasGallerySavePermission = async () => {
    if (Platform.OS !== 'android') return true;
    const checkPromise =
      Platform.Version >= 33
        ? Promise.all([
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
          ]).then(([images, video]) => images && video)
        : PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    if (await checkPromise) return true;
    if (Platform.Version >= 33) {
      const statuses = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]);
      return (
        statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED &&
        statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    return status === PermissionsAndroid.RESULTS.GRANTED;
  };

  const saveQR = (i: number) => {
    const ref = qrRefs.current[i];
    if (!ref) {
      Alert.alert('SplitUPI', 'QR not ready yet.');
      return;
    }
    ref.toDataURL(async (b64: string) => {
      try {
        if (!(await hasGallerySavePermission())) {
          Alert.alert('SplitUPI', 'Photo permission needed to save. Try Share instead.');
          return;
        }
        if (!b64 || b64.length < 5000) throw new Error('bad png');
        const path = `${RNFS.CachesDirectoryPath}/splitupi-${Date.now()}-${i}.png`;
        await RNFS.writeFile(path, b64, 'base64');
        await CameraRoll.saveAsset(`file://${path}`, { type: 'photo' });
        Alert.alert('Saved', 'QR saved to gallery.');
      } catch {
        Alert.alert('SplitUPI', 'Could not save. Try Share instead.');
      }
    });
  };

  const openUpi = async (uri: string) => {
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      {tab === 'gen' ? (
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Logo />
          <View style={styles.headerTx}>
            <Text style={styles.brand}>split<Text style={styles.gold}>upi</Text></Text>
            <Text style={styles.sub}>v{APP_VERSION} · on-device</Text>
          </View>
          <View style={styles.dot} />
        </View>

        {update ? (
          <Pressable style={styles.banner} onPress={() => Linking.openURL(update.url).catch(() => {})}>
            <Text style={styles.bannerTx}>{update.latest} available — tap to update →</Text>
          </Pressable>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.paneTitle}>$ input</Text>

          {profiles.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              {profiles.map((p) => (
                <Pressable key={p.id} onPress={() => applyProfile(p)} style={styles.chip}>
                  <Text style={styles.chipTx}>
                    {p.upiId}
                    {p.isDefault ? ' ★' : ''}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

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

          <Pressable style={styles.saveBtn} onPress={onSaveProfile}>
            <Text style={styles.saveTx}>save receiver</Text>
          </Pressable>

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
              <Pressable key={p} onPress={() => setMaxQr(String(p))} style={[styles.pill, maxQr === String(p) && styles.pillOn]}>
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

          {pv ? (
            <View style={styles.preview}>
              <Text style={styles.previewLine}>→ {previewLine(pv.parts, formatINR)} ({pv.parts.length} pkts)</Text>
              {pv.suggestion ? (
                <Pressable style={styles.nudge} onPress={() => setMaxQr(String(pv.suggestion!.max))}>
                  <Text style={styles.nudgeTx}>
                    ! {pv.parts.length} pkts is payer-heavy — max {formatINR(pv.suggestion.max)} → {pv.suggestion.parts.length} pkts · apply
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

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
                  <QRCode
                    value={g.uri}
                    size={200}
                    color="#1c1813"
                    backgroundColor="#ffffff"
                    getRef={(r) => {
                      qrRefs.current[i] = r;
                    }}
                  />
                </View>
                <View style={styles.actions}>
                  <Pressable style={styles.actGold} onPress={() => saveQR(i)}>
                    <Text style={styles.actGoldTx}>save</Text>
                  </Pressable>
                  <Pressable style={styles.act} onPress={() => sharePart(g, i, list.length)}>
                    <Text style={styles.actTx}>share</Text>
                  </Pressable>
                  <Pressable style={styles.act} onPress={() => openUpi(g.uri)}>
                    <Text style={styles.actTx}>pay</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.fine}>{DISCLAIMER_TEXT}</Text>
      </ScrollView>
      ) : (
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Checklist />
        <Text style={styles.fine}>{DISCLAIMER_TEXT}</Text>
      </ScrollView>
      )}
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'gen' && styles.tabOn]} onPress={() => setTab('gen')}>
          <Text style={[styles.tabTx, tab === 'gen' && styles.tabTxOn]}>generate</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'pay' && styles.tabOn]} onPress={() => setTab('pay')}>
          <Text style={[styles.tabTx, tab === 'pay' && styles.tabTxOn]}>checklist</Text>
        </Pressable>
      </View>
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
  banner: { backgroundColor: GOLD, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginBottom: 14 },
  bannerTx: { color: NIGHT, fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  card: { backgroundColor: PANEL, borderRadius: 14, borderWidth: 1, borderColor: '#ffffff1a', padding: 14, marginBottom: 14 },
  paneTitle: { color: GOLD, fontSize: 11, fontFamily: 'monospace', marginBottom: 10 },
  chips: { marginBottom: 6 },
  chip: { borderWidth: 1, borderColor: '#d3a62880', backgroundColor: '#d3a6211a', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6 },
  chipTx: { color: GOLD, fontSize: 11, fontFamily: 'monospace' },
  label: { color: FAINT, fontSize: 11, fontFamily: 'monospace', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ffffff1a', borderRadius: 8, backgroundColor: NIGHT, color: MIST, fontFamily: 'monospace', fontSize: 14, paddingHorizontal: 12, paddingVertical: 10 },
  inputBad: { borderColor: '#f43f5e99' },
  err: { color: '#fda4af', fontSize: 12, fontFamily: 'monospace', marginTop: 4 },
  saveBtn: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#d3a62880', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, marginTop: 8 },
  saveTx: { color: GOLD, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  presets: { flexDirection: 'row', gap: 6, marginTop: 10 },
  pill: { borderWidth: 1, borderColor: '#ffffff1a', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  pillOn: { backgroundColor: GOLD, borderColor: GOLD },
  pillTx: { color: FAINT, fontSize: 12, fontFamily: 'monospace' },
  pillTxOn: { color: NIGHT, fontWeight: 'bold' },
  preview: { marginTop: 10, borderWidth: 1, borderColor: '#ffffff14', borderRadius: 8, padding: 10, backgroundColor: NIGHT },
  previewLine: { color: MIST, fontSize: 13, fontFamily: 'monospace' },
  nudge: { marginTop: 8, borderWidth: 1, borderColor: '#d3a62880', backgroundColor: '#d3a6211a', borderRadius: 6, padding: 8 },
  nudgeTx: { color: GOLD, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' },
  go: { backgroundColor: GOLD, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  goTx: { color: NIGHT, fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace' },
  pkt: { borderWidth: 1, borderColor: '#ffffff1a', borderRadius: 10, backgroundColor: NIGHT, padding: 12, marginBottom: 10, alignItems: 'center' },
  pktTitle: { color: GOLD, fontSize: 11, fontFamily: 'monospace', marginBottom: 8 },
  qrBox: { backgroundColor: '#fff', borderRadius: 8, padding: 10 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actGold: { backgroundColor: GOLD, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 20 },
  actGoldTx: { color: NIGHT, fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  act: { borderWidth: 1, borderColor: '#ffffff26', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 20 },
  actTx: { color: MIST, fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  fine: { color: FAINT, fontSize: 10, lineHeight: 15, marginTop: 4 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ffffff1a', backgroundColor: PANEL },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabOn: { borderTopWidth: 2, borderTopColor: GOLD, marginTop: -1 },
  tabTx: { color: FAINT, fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' },
  tabTxOn: { color: GOLD },
});
