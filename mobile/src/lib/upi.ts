export interface UPIParams {
  upiId: string;
  receiverName: string;
  amount: number;
  note?: string;
}

export function formatUpiAmount(amount: number): string {
  return (Math.round(amount * 100) / 100).toFixed(2);
}

export function buildUpiUri({ upiId, receiverName, amount, note }: UPIParams): string {
  const pa = upiId.trim();
  const pn = receiverName.trim();
  const am = formatUpiAmount(amount);
  const tn = (note ?? '').trim();

  const encPa = encodeURIComponent(pa).replace(/%40/g, '@');
  let uri = `upi://pay?pa=${encPa}&pn=${encodeURIComponent(pn)}&am=${encodeURIComponent(am)}&cu=INR`;
  if (tn) uri += `&tn=${encodeURIComponent(tn)}`;
  return uri;
}
