import { describe, expect, it } from 'vitest';
import { isValidUpiId, validateInputs, type PaymentInputs } from '../src/lib/validation';

const good: PaymentInputs = {
  upiId: 'mohit@upi',
  receiverName: 'Mohit Kumar',
  totalAmount: '4500',
  maxPerQr: '1999',
  note: 'Invoice 001',
};

describe('isValidUpiId', () => {
  it.each(['mohit@upi', '98xxxxxx@okhdfc', 'name.surname@okaxis', 'ab@cd'])('accepts %s', (v) => {
    expect(isValidUpiId(v)).toBe(true);
  });
  it.each(['', 'no-at-sign', 'a@b', 'two@@upi', 'has space@upi', '@upi', 'x@'])('rejects %s', (v) => {
    expect(isValidUpiId(v)).toBe(false);
  });
});

describe('validateInputs — happy path', () => {
  it('accepts a valid form and returns exact parts', () => {
    const r = validateInputs(good);
    expect(r.ok).toBe(true);
    expect(r.parts).toEqual([1999, 1999, 502]);
  });
});

describe('validateInputs — denial cases', () => {
  it('0 amount is an error and yields no QRs', () => {
    const r = validateInputs({ ...good, totalAmount: '0' });
    expect(r.ok).toBe(false);
    expect(r.errors.totalAmount).toBeTruthy();
    expect(r.parts).toBeUndefined();
  });
  it('negative and over-precise amounts are errors', () => {
    expect(validateInputs({ ...good, totalAmount: '-5' }).ok).toBe(false);
    expect(validateInputs({ ...good, totalAmount: '10.999' }).ok).toBe(false);
    expect(validateInputs({ ...good, maxPerQr: '0' }).ok).toBe(false);
  });
  it('invalid UPI ID is an error', () => {
    const r = validateInputs({ ...good, upiId: 'not-an-upi' });
    expect(r.ok).toBe(false);
    expect(r.errors.upiId).toBeTruthy();
  });
  it('missing receiver name is an error', () => {
    expect(validateInputs({ ...good, receiverName: ' ' }).ok).toBe(false);
  });
  it('splits needing over the safety limit are refused', () => {
    // 10000 / 100 = 100 QRs > 50 limit
    const r = validateInputs({ ...good, totalAmount: '10000', maxPerQr: '100' });
    expect(r.ok).toBe(false);
    expect(r.errors.general).toMatch(/limit/);
  });
});
