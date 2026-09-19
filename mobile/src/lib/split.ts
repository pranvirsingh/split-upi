/**
 * Split a total amount into multiple payments, each capped at maxPerPayment.
 * Integer paise arithmetic — sums always exact.
 */
export function splitAmount(totalAmount: number, maxPerPayment: number): number[] {
  if (!Number.isFinite(totalAmount) || !Number.isFinite(maxPerPayment)) {
    throw new Error('Amounts must be finite numbers.');
  }
  if (totalAmount <= 0) throw new Error('Total amount must be greater than 0.');
  if (maxPerPayment <= 0) throw new Error('Maximum per QR must be greater than 0.');

  const totalPaise = Math.round(totalAmount * 100);
  const maxPaise = Math.round(maxPerPayment * 100);

  if (totalPaise <= 0) throw new Error('Total amount must be greater than 0.');
  if (maxPaise <= 0) throw new Error('Maximum per QR must be greater than 0.');

  const parts: number[] = [];
  let remaining = totalPaise;
  while (remaining > maxPaise) {
    parts.push(maxPaise);
    remaining -= maxPaise;
  }
  if (remaining > 0) parts.push(remaining);

  return parts.map((p) => Math.round(p) / 100);
}

export function sumAmounts(amounts: number[]): number {
  const paise = amounts.reduce((acc, a) => acc + Math.round(a * 100), 0);
  return paise / 100;
}
