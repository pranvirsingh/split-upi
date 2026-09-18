import { describe, expect, it } from 'vitest';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { splitAmount } from '../src/lib/split';
import { buildUpiUri } from '../src/lib/upi';

async function decodeQrPng(text: string): Promise<string> {
  const buf = await QRCode.toBuffer(text, { width: 256, margin: 1, errorCorrectionLevel: 'M' });
  const png = PNG.sync.read(buf);
  const found = jsQR(png.data, png.width, png.height);
  if (!found) throw new Error(`QR not decodable: ${text}`);
  return found.data;
}

describe('QR integrity — decoded payload equals the exact UPI URI', () => {
  for (const amount of splitAmount(4500, 1999)) {
    it(`₹${amount} QR decodes to its own URI`, async () => {
      const uri = buildUpiUri({
        upiId: 'mohit@upi',
        receiverName: 'Mohit Kumar',
        amount,
        note: 'Invoice 001',
      });
      await expect(decodeQrPng(uri)).resolves.toBe(uri);
    });
  }

  it('remainder part (₹502) carries am=502.00', async () => {
    const uri = buildUpiUri({ upiId: 'a@upi', receiverName: 'A B', amount: 502, note: '' });
    const decoded = await decodeQrPng(uri);
    expect(decoded).toContain('am=502.00');
  });
});
