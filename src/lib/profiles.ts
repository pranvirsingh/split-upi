export interface ReceiverProfile {
  id: string; // = lowercased upiId
  upiId: string;
  name: string;
  maxPerQr: string;
  note: string;
  isDefault: boolean;
  lastUsed: number;
}

export interface ProfileStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const KEY = 'splitupi.profiles.v1';

function memStore(): ProfileStore {
  const m = new Map<string, string>();
  return {
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

function storage(): ProfileStore {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Touch it once — private mode can throw on access.
      window.localStorage.getItem(KEY);
      return window.localStorage;
    }
  } catch {
    /* fall through to memory */
  }
  return memStore();
}

export function loadProfiles(store: ProfileStore = storage()): ReceiverProfile[] {
  try {
    const raw = store.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ReceiverProfile[];
    if (!Array.isArray(arr)) return [];
    return arr.filter((p) => p && typeof p.upiId === 'string' && p.upiId.includes('@'));
  } catch {
    return [];
  }
}

function persist(store: ProfileStore, profiles: ReceiverProfile[]) {
  try {
    store.setItem(KEY, JSON.stringify(profiles));
  } catch {
    /* storage full/blocked — profiles just don't persist */
  }
}

/** Save (or update) the profile for this UPI ID and make it the default. */
export function saveProfile(
  input: Omit<ReceiverProfile, 'id' | 'isDefault' | 'lastUsed'>,
  store: ProfileStore = storage(),
): ReceiverProfile[] {
  const id = input.upiId.trim().toLowerCase();
  const profiles = loadProfiles(store).map((p) => ({ ...p, isDefault: false }));
  const next: ReceiverProfile = {
    ...input,
    upiId: input.upiId.trim(),
    name: input.name.trim(),
    id,
    isDefault: true,
    lastUsed: Date.now(),
  };
  const i = profiles.findIndex((p) => p.id === id);
  if (i >= 0) profiles[i] = { ...next, lastUsed: Date.now() };
  else profiles.unshift(next);
  persist(store, profiles.slice(0, 20)); // cap: newest 20
  return loadProfiles(store);
}

export function setDefaultProfile(id: string, store: ProfileStore = storage()): ReceiverProfile[] {
  const profiles = loadProfiles(store).map((p) => ({ ...p, isDefault: p.id === id }));
  persist(store, profiles);
  return profiles;
}

export function deleteProfile(id: string, store: ProfileStore = storage()): ReceiverProfile[] {
  const profiles = loadProfiles(store).filter((p) => p.id !== id);
  if (profiles.length > 0 && !profiles.some((p) => p.isDefault)) profiles[0].isDefault = true;
  persist(store, profiles);
  return profiles;
}

export function getDefaultProfile(store: ProfileStore = storage()): ReceiverProfile | null {
  const profiles = loadProfiles(store);
  return profiles.find((p) => p.isDefault) ?? profiles[0] ?? null;
}

/** Suggest a max-per-QR that keeps the split to at most 4 parts. */
export function suggestMaxForFewParts(total: number, targetParts = 4): number {
  const totalPaise = Math.round(total * 100);
  return Math.ceil(totalPaise / targetParts) / 100;
}

/** Compact preview line: "1,999x2 + 502". */
export function previewLine(parts: number[], fmt: (n: number) => string): string {
  const counts = new Map<number, number>();
  for (const p of parts) counts.set(p, (counts.get(p) ?? 0) + 1);
  return [...counts.entries()].map(([amt, c]) => (c > 1 ? `${fmt(amt)}x${c}` : fmt(amt))).join(' + ');
}
