import { RELEASES_URL } from './constants';
import { version as APP_VERSION } from '../../package.json';

export { APP_VERSION };

/** Compare dotted versions: -1 if a<b, 0 if equal, 1 if a>b. */
export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

export interface UpdateInfo {
  latest: string; // e.g. "v1.8.0"
  url: string; // release page (carries the APK)
}

/**
 * Ask GitHub for the newest release. Silent null when offline,
 * rate-limited, or already current. Call once per launch.
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch('https://api.github.com/repos/pranvirsingh/split-upi/releases/latest', {
      signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { tag_name?: string; html_url?: string };
    const latest = String(j.tag_name ?? '');
    if (!latest) return null;
    if (compareVersions(latest, APP_VERSION) <= 0) return null;
    return { latest, url: j.html_url || RELEASES_URL };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
