export interface UPIParams {
  upiId: string;
  receiverName: string;
  amount: number;
  note?: string;
}

/** Format amount as UPI expects: exactly 2 decimals, e.g. 1999.00 */
export function formatUpiAmount(amount: number): string {
  return (Math.round(amount * 100) / 100).toFixed(2);
}

/**
 * Build a standard UPI payment URI:
 * upi://pay?pa={UPI_ID}&pn={RECEIVER_NAME}&am={AMOUNT}&cu=INR&tn={NOTE}
 * All params are URL-encoded (`@` in the UPI ID is left readable, matching
 * the canonical examples — `%40` decodes identically). `tn` is omitted when empty.
 */
export function buildUpiUri({ upiId, receiverName, amount, note }: UPIParams): string {
  const pa = upiId.trim();
  const pn = receiverName.trim();
  const am = formatUpiAmount(amount);
  const tn = (note ?? '').trim();

  // encodeURIComponent encodes '@' as %40; keep '@' literal for canonical UPI URIs
  const encPa = encodeURIComponent(pa).replace(/%40/g, '@');
  let uri = `upi://pay?pa=${encPa}&pn=${encodeURIComponent(pn)}&am=${encodeURIComponent(am)}&cu=INR`;
  if (tn) uri += `&tn=${encodeURIComponent(tn)}`;
  return uri;
}
