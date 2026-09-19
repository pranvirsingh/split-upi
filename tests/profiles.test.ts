import { describe, expect, it } from 'vitest';
import {
  deleteProfile,
  getDefaultProfile,
  loadProfiles,
  saveProfile,
  setDefaultProfile,
  suggestMaxForFewParts,
  previewLine,
  type ProfileStore,
} from '../src/lib/profiles';
import { formatINR } from '../src/lib/format';

function freshStore(): ProfileStore {
  const m = new Map<string, string>();
  return {
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

const a = { upiId: 'example@upi', name: 'Example Name', maxPerQr: '1999', note: '' };
const b = { upiId: 'shop@okbank', name: 'Shop', maxPerQr: '4999', note: 'rent' };

describe('profiles', () => {
  it('starts empty, saves first profile as default', () => {
    const s = freshStore();
    expect(loadProfiles(s)).toEqual([]);
    const all = saveProfile(a, s);
    expect(all).toHaveLength(1);
    expect(getDefaultProfile(s)?.upiId).toBe('example@upi');
  });
  it('saving makes that profile the default, keeps others', () => {
    const s = freshStore();
    saveProfile(a, s);
    saveProfile(b, s);
    const all = loadProfiles(s);
    expect(all).toHaveLength(2);
    expect(getDefaultProfile(s)?.upiId).toBe('shop@okbank');
  });
  it('re-saving same UPI ID updates instead of duplicating', () => {
    const s = freshStore();
    saveProfile(a, s);
    saveProfile({ ...a, name: 'New Name' }, s);
    const all = loadProfiles(s);
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('New Name');
  });
  it('switch default + delete (fallback default survives)', () => {
    const s = freshStore();
    saveProfile(a, s);
    saveProfile(b, s);
    setDefaultProfile('example@upi', s);
    expect(getDefaultProfile(s)?.upiId).toBe('example@upi');
    deleteProfile('example@upi', s);
    expect(loadProfiles(s)).toHaveLength(1);
    expect(getDefaultProfile(s)?.upiId).toBe('shop@okbank');
  });
  it('corrupt storage reads as empty, never throws', () => {
    const s = freshStore();
    s.setItem('splitupi.profiles.v1', 'not-json{{{');
    expect(loadProfiles(s)).toEqual([]);
    expect(getDefaultProfile(s)).toBeNull();
  });
});

describe('preview helpers', () => {
  it('suggestMaxForFewParts keeps splits to 4', () => {
    expect(suggestMaxForFewParts(11000)).toBe(2750);
    expect(suggestMaxForFewParts(4500)).toBe(1125);
  });
  it('previewLine compacts repeats', () => {
    expect(previewLine([1999, 1999, 502], formatINR)).toBe('1,999x2 + 502');
    expect(previewLine([500], formatINR)).toBe('500');
  });
});
