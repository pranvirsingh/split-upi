import { describe, expect, it } from 'vitest';
import {
  deleteFrom,
  getDefault,
  parseProfiles,
  saveProfileTo,
  setDefaultIn,
  suggestMaxForFewParts,
  previewLine,
} from '../mobile/src/lib/profiles';
import { compareVersions } from '../mobile/src/lib/update';
import { decodePayView, encodePayView, payViewUrl } from '../mobile/src/lib/payview';
import { formatINR } from '../mobile/src/lib/format';

const a = { upiId: 'example@upi', name: 'Example Name', maxPerQr: '1999', note: '' };

describe('mobile profiles (pure)', () => {
  it('save → default → refill → delete', () => {
    let list = saveProfileTo([], a);
    expect(getDefault(list)?.upiId).toBe('example@upi');
    list = saveProfileTo(list, { upiId: 'shop@okbank', name: 'Shop', maxPerQr: '4999', note: '' });
    expect(list).toHaveLength(2);
    list = saveProfileTo(list, { ...a, name: 'New' });
    expect(list).toHaveLength(2);
    list = setDefaultIn(list, 'example@upi');
    expect(getDefault(list)?.name).toBe('New');
    list = deleteFrom(list, 'example@upi');
    expect(getDefault(list)?.upiId).toBe('shop@okbank');
  });
  it('bad JSON parses to empty', () => {
    expect(parseProfiles('{{{')).toEqual([]);
    expect(parseProfiles(null)).toEqual([]);
  });
  it('preview helpers', () => {
    expect(suggestMaxForFewParts(11000)).toBe(2750);
    expect(previewLine([1999, 1999, 502], formatINR)).toBe('1,999x2 + 502');
  });
});

describe('mobile update + payview', () => {
  it('compareVersions orders', () => {
    expect(compareVersions('1.9.0', '1.8.0')).toBe(1);
    expect(compareVersions('1.8.0', '1.9.0')).toBe(-1);
    expect(compareVersions('1.9.0', '1.9.0')).toBe(0);
  });
  it('pay link uses canonical base, round-trips', () => {
    const s = { v: 1 as const, pa: 'example@upi', pn: 'Example Name', tn: '', parts: [1999, 502] };
    const url = payViewUrl(s, 'https://split-upi-ochre.vercel.app');
    expect(url.startsWith('https://split-upi-ochre.vercel.app#p=')).toBe(true);
    expect(decodePayView(new URL(url).hash)).toEqual(s);
  });
  it('decode rejects junk', () => {
    expect(decodePayView('#p=!!!')).toBeNull();
    expect(decodePayView(`#p=${encodePayView({ v: 1, pa: 'x', pn: 'AB', tn: '', parts: [1] })}`)).toBeNull();
  });
  it('decodes a full pasted site URL (checklist paste flow)', () => {
    const s = { v: 1 as const, pa: 'example@upi', pn: 'Example Name', tn: 'rent', parts: [1999, 502] };
    const full = `https://split-upi-ochre.vercel.app/#p=${encodePayView(s)}`;
    expect(decodePayView(full)).toEqual(s);
  });
});
