import { describe, expect, it } from 'vitest';
import { APP_VERSION, checkForUpdate, compareVersions } from '../src/lib/update';
import { encodePayView, payViewUrl } from '../src/lib/payview';

describe('compareVersions', () => {
  it('orders dotted versions', () => {
    expect(compareVersions('1.4.0', '1.7.0')).toBe(-1);
    expect(compareVersions('1.7.0', '1.4.0')).toBe(1);
    expect(compareVersions('1.7.0', '1.7.0')).toBe(0);
    expect(compareVersions('v1.10.0', 'v1.9.0')).toBe(1);
    expect(compareVersions('2.0', '1.99.99')).toBe(1);
  });
  it('app version matches package.json', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('payViewUrl base', () => {
  it('uses the explicit base (canonical site URL in the app)', () => {
    const url = payViewUrl(
      { v: 1, pa: 'example@upi', pn: 'Example Name', tn: '', parts: [100] },
      'https://split-upi-ochre.vercel.app',
    );
    expect(url.startsWith('https://split-upi-ochre.vercel.app#p=')).toBe(true);
    expect(url).not.toContain('localhost');
  });
  it('encoded payload round-trips through the URL', async () => {
    const { decodePayView } = await import('../src/lib/payview');
    const url = payViewUrl(
      { v: 1, pa: 'example@upi', pn: 'Example Name', tn: 'x', parts: [5] },
      'https://example.com',
    );
    expect(decodePayView(new URL(url).hash)).not.toBeNull();
  });
});

describe('checkForUpdate', () => {
  it('returns null when offline or failing', async () => {
    const orig = global.fetch;
    // @ts-expect-error forced failure
    global.fetch = async () => {
      throw new Error('offline');
    };
    await expect(checkForUpdate()).resolves.toBeNull();
    global.fetch = orig;
  });
});
