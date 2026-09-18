import { describe, expect, it } from 'vitest';
import { splitAmount, sumAmounts } from '../src/lib/split';

describe('splitAmount — required spec cases', () => {
  it('4500 / 1999 = 1999 + 1999 + 502', () => {
    expect(splitAmount(4500, 1999)).toEqual([1999, 1999, 502]);
  });
  it('10000 / 1999 = 5×1999 + 5', () => {
    expect(splitAmount(10000, 1999)).toEqual([1999, 1999, 1999, 1999, 1999, 5]);
  });
  it('1999 / 1999 = 1999', () => {
    expect(splitAmount(1999, 1999)).toEqual([1999]);
  });
  it('1998 / 1999 = 1998', () => {
    expect(splitAmount(1998, 1999)).toEqual([1998]);
  });
});

describe('splitAmount — extras', () => {
  it('2000 / 1999 = 1999 + 1', () => {
    expect(splitAmount(2000, 1999)).toEqual([1999, 1]);
  });
  it('5997 / 1999 = 3×1999', () => {
    expect(splitAmount(5997, 1999)).toEqual([1999, 1999, 1999]);
  });
  it('1000 under the cap stays whole', () => {
    expect(splitAmount(1000, 1999)).toEqual([1000]);
  });
  it('paise stay exact (100.55 / 50)', () => {
    expect(splitAmount(100.55, 50)).toEqual([50, 50, 0.55]);
  });
  it('sums exactly and never exceeds the cap', () => {
    for (const [t, m] of [[4500, 1999], [10000, 1999], [12345.67, 1999], [999.99, 499]] as const) {
      const parts = splitAmount(t, m);
      expect(sumAmounts(parts)).toBeCloseTo(t, 10);
      expect(parts.every((p) => p <= m)).toBe(true);
    }
  });
  it('rejects zero / negative / non-finite input', () => {
    expect(() => splitAmount(0, 1999)).toThrow();
    expect(() => splitAmount(-5, 1999)).toThrow();
    expect(() => splitAmount(100, 0)).toThrow();
    expect(() => splitAmount(NaN, 1999)).toThrow();
  });
});
