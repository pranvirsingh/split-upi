import { describe, expect, it } from 'vitest';
import { buildUpiUri, formatUpiAmount } from '../src/lib/upi';

describe('formatUpiAmount', () => {
  it('always 2 decimals', () => {
    expect(formatUpiAmount(1999)).toBe('1999.00');
    expect(formatUpiAmount(502)).toBe('502.00');
    expect(formatUpiAmount(0.55)).toBe('0.55');
  });
});

describe('buildUpiUri', () => {
  it('matches the canonical spec example', () => {
    expect(
      buildUpiUri({ upiId: 'example@upi', receiverName: 'Example Name', amount: 1999, note: 'Invoice 001' }),
    ).toBe('upi://pay?pa=example@upi&pn=Example%20Name&am=1999.00&cu=INR&tn=Invoice%20001');
  });
  it('omits tn when the note is empty', () => {
    const uri = buildUpiUri({ upiId: 'a@upi', receiverName: 'A B', amount: 502, note: '' });
    expect(uri).toBe('upi://pay?pa=a@upi&pn=A%20B&am=502.00&cu=INR');
    expect(uri).not.toContain('tn=');
  });
  it('encodes special chars in note and name', () => {
    const uri = buildUpiUri({ upiId: 'x@upi', receiverName: 'A&B', amount: 10, note: 'a/b?c' });
    expect(uri).toContain('pn=A%26B');
    expect(uri).toContain('tn=a%2Fb%3Fc');
  });
  it('trims whitespace', () => {
    const uri = buildUpiUri({ upiId: '  m@upi ', receiverName: ' M ', amount: 1, note: '  ' });
    expect(uri).toBe('upi://pay?pa=m@upi&pn=M&am=1.00&cu=INR');
  });
});
