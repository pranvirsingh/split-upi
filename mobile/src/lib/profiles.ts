export interface ReceiverProfile {
  id: string;
  upiId: string;
  name: string;
  maxPerQr: string;
  note: string;
  isDefault: boolean;
  lastUsed: number;
}

export type ProfileInput = Omit<ReceiverProfile, 'id' | 'isDefault' | 'lastUsed'>;

/** Parse stored JSON, never throws. Storage layer lives outside (AsyncStorage). */
export function parseProfiles(raw: string | null): ReceiverProfile[] {
  try {
    if (!raw) return [];
    const arr = JSON.parse(raw) as ReceiverProfile[];
    if (!Array.isArray(arr)) return [];
    return arr.filter((p) => p && typeof p.upiId === 'string' && p.upiId.includes('@'));
  } catch {
    return [];
  }
}

export function serializeProfiles(p: ReceiverProfile[]): string {
  return JSON.stringify(p);
}

export function saveProfileTo(list: ReceiverProfile[], input: ProfileInput): ReceiverProfile[] {
  const id = input.upiId.trim().toLowerCase();
  const base = list.map((p) => ({ ...p, isDefault: false }));
  const next: ReceiverProfile = {
    ...input,
    upiId: input.upiId.trim(),
    name: input.name.trim(),
    id,
    isDefault: true,
    lastUsed: Date.now(),
  };
  const i = base.findIndex((p) => p.id === id);
  if (i >= 0) base[i] = next;
  else base.unshift(next);
  return base.slice(0, 20);
}

export function setDefaultIn(list: ReceiverProfile[], id: string): ReceiverProfile[] {
  return list.map((p) => ({ ...p, isDefault: p.id === id }));
}

export function deleteFrom(list: ReceiverProfile[], id: string): ReceiverProfile[] {
  const rest = list.filter((p) => p.id !== id);
  if (rest.length > 0 && !rest.some((p) => p.isDefault)) rest[0].isDefault = true;
  return rest;
}

export function getDefault(list: ReceiverProfile[]): ReceiverProfile | null {
  return list.find((p) => p.isDefault) ?? list[0] ?? null;
}

export function suggestMaxForFewParts(total: number, targetParts = 4): number {
  return Math.ceil(Math.round(total * 100) / targetParts) / 100;
}

export function previewLine(parts: number[], fmt: (n: number) => string): string {
  const counts = new Map<number, number>();
  for (const p of parts) counts.set(p, (counts.get(p) ?? 0) + 1);
  return [...counts.entries()].map(([amt, c]) => (c > 1 ? `${fmt(amt)}x${c}` : fmt(amt))).join(' + ');
}
