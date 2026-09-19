import { MAX_QR_COUNT, MAX_TOTAL_AMOUNT } from './constants';
import { isValidUpiId } from './validation';

// Hermes + browsers + Node all provide these at runtime.
declare const btoa: (s: string) => string;
declare const atob: (s: string) => string;

export interface PayViewState {
  v: 1;
  pa: string;
  pn: string;
  tn: string;
  parts: number[];
}

function toB64Url(json: string): string {
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return decodeURIComponent(escape(atob(b64 + pad)));
}

export function encodePayView(state: PayViewState): string {
  return toB64Url(JSON.stringify(state));
}

export function decodePayView(hash: string): PayViewState | null {
  try {
    const m = hash.match(/#p=([A-Za-z0-9\-_]+)/);
    if (!m) return null;
    const o = JSON.parse(fromB64Url(m[1])) as Partial<PayViewState>;
    if (o?.v !== 1) return null;
    if (typeof o.pa !== 'string' || !isValidUpiId(o.pa)) return null;
    if (typeof o.pn !== 'string' || o.pn.trim().length < 2 || o.pn.length > 60) return null;
    if (typeof o.tn !== 'string' || o.tn.length > 80) return null;
    if (!Array.isArray(o.parts) || o.parts.length < 1 || o.parts.length > MAX_QR_COUNT) return null;
    let sumPaise = 0;
    for (const p of o.parts) {
      if (typeof p !== 'number' || !Number.isFinite(p) || p <= 0) return null;
      if (Math.abs(Math.round(p * 100) - p * 100) > 1e-6) return null;
      sumPaise += Math.round(p * 100);
    }
    if (sumPaise <= 0 || sumPaise > Math.round(MAX_TOTAL_AMOUNT * 100)) return null;
    return { v: 1, pa: o.pa.trim(), pn: o.pn.trim(), tn: o.tn.trim(), parts: o.parts };
  } catch {
    return null;
  }
}

/** Base is always explicit here — the site URL, so links work everywhere. */
export function payViewUrl(state: PayViewState, base: string): string {
  return `${base}#p=${encodePayView(state)}`;
}
