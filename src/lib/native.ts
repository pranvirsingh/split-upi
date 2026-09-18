import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/** True inside the installed Android app, false on the website. */
export const isNative = () => Capacitor.isNativePlatform();

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
