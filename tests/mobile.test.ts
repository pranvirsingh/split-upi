import { describe, expect, it } from 'vitest';
import { splitAmount } from '../mobile/src/lib/split';
import { buildUpiUri } from '../mobile/src/lib/upi';
import { isValidUpiId, validateInputs } from '../mobile/src/lib/validation';

// The native engine must behave exactly like the web engine.
describe('mobile engine parity', () => {
  it('splits identically', () => {
    expect(splitAmount(4500, 1999)).toEqual([1999, 1999, 502]);
    expect(splitAmount(10000, 1999)).toEqual([1999, 1999, 1999, 1999, 1999, 5]);
  });
  it('builds identical URIs', () => {
    expect(
      buildUpiUri({ upiId: 'example@upi', receiverName: 'Example Name', amount: 1999, note: 'Invoice 001' }),
    ).toBe('upi://pay?pa=example@upi&pn=Example%20Name&am=1999.00&cu=INR&tn=Invoice%20001');
  });
  it('validates identically', () => {
    const ok = validateInputs({
      upiId: 'example@upi',
      receiverName: 'Example Name',
      totalAmount: '4500',
      maxPerQr: '1999',
      note: '',
    });
    expect(ok.ok).toBe(true);
    expect(ok.parts).toEqual([1999, 1999, 502]);
    expect(isValidUpiId('bad')).toBe(false);
    expect(validateInputs({ upiId: 'x', receiverName: 'y', totalAmount: '0', maxPerQr: '1', note: '' }).ok).toBe(false);
  });
});
