import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/** True inside the installed Android app, false on the website. */
export const isNative = () => Capacitor.isNativePlatform();

/**
 * Native multi-share: writes every PNG to cache, opens ONE system sheet
 * with all files. Used by Download All inside the app.
 */
export async function shareMultipleImages(
  items: { dataUrl: string; filename: string }[],
): Promise<'shared' | 'failed'> {
  try {
    const files: string[] = [];
    for (const it of items) {
      const { uri } = await Filesystem.writeFile({
        path: it.filename,
        data: it.dataUrl.split(',')[1],
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
  } catch {
    return 'failed';
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
    const base64 = dataUrl.split(',')[1];
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
  } catch {
    return 'failed';
  }
}
