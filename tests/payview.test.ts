import { describe, expect, it } from 'vitest';
import { decodePayView, encodePayView, type PayViewState } from '../src/lib/payview';

const good: PayViewState = {
  v: 1,
  pa: 'example@upi',
  pn: 'Example Name',
  tn: 'Invoice 001',
  parts: [1999, 1999, 502],
};

describe('payview codec', () => {
  it('round-trips Unicode names and notes', () => {
    const s: PayViewState = { ...good, pn: 'Dükkan Ödeme', tn: 'fatura ücreti' };
    const back = decodePayView(`#p=${encodePayView(s)}`);
    expect(back).toEqual(s);
  });
  it('round-trips exactly', () => {
    expect(decodePayView(`#p=${encodePayView(good)}`)).toEqual(good);
  });
  it('rejects garbage, wrong version, bad UPI, bad parts', () => {
    expect(decodePayView('')).toBeNull();
    expect(decodePayView('#p=!!!')).toBeNull();
    expect(decodePayView('#p=' + btoa('{}').replace(/=+$/, ''))).toBeNull();
    expect(decodePayView(`#p=${encodePayView({ ...good, pa: 'nope' })}`)).toBeNull();
    expect(decodePayView(`#p=${encodePayView({ ...good, parts: [] })}`)).toBeNull();
    expect(decodePayView(`#p=${encodePayView({ ...good, parts: [10, -5] })}`)).toBeNull();
    expect(decodePayView(`#p=${encodePayView({ ...good, parts: [10.999] })}`)).toBeNull();
    expect(decodePayView(`#p=${encodePayView({ ...good, parts: new Array(51).fill(10) })}`)).toBeNull();
  });
  it('encoded payload is URL-safe (no +/= chars)', () => {
    expect(encodePayView(good)).toMatch(/^[A-Za-z0-9\-_]+$/);
  });
});
