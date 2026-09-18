export const MAX_TOTAL_AMOUNT = 1000000; // ₹10,00,000 configurable maximum
export const MAX_QR_COUNT = 50; // safety limit
export const DEFAULT_MAX_PER_QR = 1999;
export const MIN_AMOUNT = 0.01;

export const PRESETS = [499, 999, 1999, 4999] as const;

export const DISCLAIMER_TEXT =
  'SplitUPI generates UPI payment QR codes for convenience. It does not process payments or guarantee avoidance of any bank, UPI app, merchant, platform, or payment-provider fees, limits, or policies. Applicable charges and transaction limits are determined by the relevant payment provider.';
