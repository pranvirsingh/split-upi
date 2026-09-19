import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/** True inside the installed Android app, false on the website. */
export const isNative = () => Capacitor.isNativePlatform();

function dismissed(e: unknown): boolean {
  return /cancel|dismiss|abort|no activity|not available/i.test(String((e as Error)?.message ?? e ?? ''));
}

function pngBytes(dataUrl: string): string | null {
  const i = dataUrl.indexOf(',');
  if (!dataUrl.startsWith('data:image/png;base64,') || i < 0) return null;
  const b64 = dataUrl.slice(i + 1);
  if (b64.length < 20000) return null; // corrupt/placeholder guard
  return b64;
}

/**
 * Native multi-share: writes every PNG to cache, opens ONE system sheet
 * with all files. Used by Download All inside the app.
 */
export async function shareMultipleImages(
  items: { dataUrl: string; filename: string }[],
): Promise<'shared' | 'failed'> {
  try {
    if (items.length === 0) return 'failed';
    const files: string[] = [];
    for (const it of items) {
      const b64 = pngBytes(it.dataUrl);
      if (!b64) return 'failed';
      const { uri } = await Filesystem.writeFile({
        path: it.filename,
        data: b64,
        directory: Directory.Cache,
      });
      files.push(uri);
    }
    await Share.share({
      title: 'SplitUPI QRs',
      text: `${items.length} payment QRs`,
      files,
      dialogTitle: 'Save or share QRs',
    });
    return 'shared';
  } catch (e) {
    return dismissed(e) ? 'shared' : 'failed';
  }
}

/**
 * Native save/share: writes the PNG to cache and opens the system sheet
 * (save to Photos/Files, WhatsApp, Drive…). No storage permission needed.
 */
export async function saveAndShareImage(
  dataUrl: string,
  filename: string,
): Promise<'shared' | 'failed'> {
  try {
    const base64 = pngBytes(dataUrl);
    if (!base64) return 'failed';
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
    });
    await Share.share({
      title: 'SplitUPI QR',
      text: 'SplitUPI payment QR',
      files: [uri],
      dialogTitle: 'Save or share QR',
    });
    return 'shared';
  } catch (e) {
    return dismissed(e) ? 'shared' : 'failed';
  }
}
