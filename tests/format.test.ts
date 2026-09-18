import { describe, expect, it } from 'vitest';
import { formatINR, formatINRExact } from '../src/lib/format';

describe('formatINR', () => {
  it('Indian grouping, whole numbers without decimals', () => {
    expect(formatINR(4500)).toBe('4,500');
    expect(formatINR(100000)).toBe('1,00,000');
  });
  it('keeps paise when present', () => {
    expect(formatINR(1999.5)).toBe('1,999.50');
  });
  it('exact variant always shows 2 decimals', () => {
    expect(formatINRExact(1999)).toBe('1,999.00');
  });
});
