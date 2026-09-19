import { MAX_QR_COUNT, MAX_TOTAL_AMOUNT } from './constants';
import { splitAmount } from './split';

export interface PaymentInputs {
  upiId: string;
  receiverName: string;
  totalAmount: string;
  maxPerQr: string;
  note: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<'upiId' | 'receiverName' | 'totalAmount' | 'maxPerQr' | 'general', string>>;
  total?: number;
  max?: number;
  parts?: number[];
}

const UPI_RE = /^[\w.\-]{2,}@[a-zA-Z]{2,}[\w.-]*$/;

export function isValidUpiId(v: string): boolean {
  const s = v.trim();
  if (!s || s.includes(' ') || (s.match(/@/g) || []).length !== 1) return false;
  return UPI_RE.test(s);
}

function parseAmount(raw: string): number | null {
  const s = raw.trim().replace(/,/g, '');
  if (!s) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return NaN as unknown as null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function validateInputs(inputs: PaymentInputs): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  const upiId = inputs.upiId.trim();
  if (!upiId) errors.upiId = 'Enter your UPI ID.';
  else if (!isValidUpiId(upiId)) errors.upiId = 'Enter a valid UPI ID.';

  const name = inputs.receiverName.trim();
  if (!name) errors.receiverName = 'Enter the receiver name.';
  else if (name.length < 2) errors.receiverName = 'Name looks too short.';

  const total = parseAmount(inputs.totalAmount);
  if (inputs.totalAmount.trim() === '' || total === null) {
    errors.totalAmount = 'Enter a valid total.';
  } else if (Number.isNaN(total as unknown as number)) {
    errors.totalAmount = 'Max 2 decimals.';
  } else if ((total as number) <= 0) {
    errors.totalAmount = 'Must be more than Rs.0.';
  } else if ((total as number) > MAX_TOTAL_AMOUNT) {
    errors.totalAmount = 'Amount too large.';
  }

  const max = parseAmount(inputs.maxPerQr);
  if (inputs.maxPerQr.trim() === '' || max === null) {
    errors.maxPerQr = 'Enter max per QR.';
  } else if (Number.isNaN(max as unknown as number)) {
    errors.maxPerQr = 'Max 2 decimals.';
  } else if ((max as number) <= 0) {
    errors.maxPerQr = 'Must be more than Rs.0.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const t = total as number;
  const m = max as number;

  let parts: number[];
  try {
    parts = splitAmount(t, m);
  } catch (e) {
    return { ok: false, errors: { general: (e as Error).message } };
  }

  if (parts.length > MAX_QR_COUNT) {
    return {
      ok: false,
      errors: { general: `${parts.length} QRs needed (max ${MAX_QR_COUNT}). Raise max per QR.` },
    };
  }

  return { ok: true, errors: {}, total: t, max: m, parts };
}
