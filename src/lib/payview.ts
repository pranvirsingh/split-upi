import { MAX_QR_COUNT, MAX_TOTAL_AMOUNT } from './constants';
import { isValidUpiId } from './validation';

export interface PayViewState {
  v: 1;
  pa: string; // receiver UPI ID
  pn: string; // receiver name
  tn: string; // note (may be empty)
  parts: number[]; // exact per-part amounts
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

/** Pack checklist state into a shareable `#p=` hash. Data stays client-side. */
export function encodePayView(state: PayViewState): string {
  return toB64Url(JSON.stringify(state));
}

/** Unpack + strictly validate. Returns null for anything malformed or unsafe. */
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
      if (Math.abs(Math.round(p * 100) - p * 100) > 1e-6) return null; // >2 decimals
      sumPaise += Math.round(p * 100);
    }
    if (sumPaise <= 0 || sumPaise > Math.round(MAX_TOTAL_AMOUNT * 100)) return null;
    return { v: 1, pa: o.pa.trim(), pn: o.pn.trim(), tn: o.tn.trim(), parts: o.parts };
  } catch {
    return null;
  }
}

/** Full shareable URL for the current page. */
export function payViewUrl(state: PayViewState): string {
  return `${window.location.origin}${window.location.pathname}#p=${encodePayView(state)}`;
}
