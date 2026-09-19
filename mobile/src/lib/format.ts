export function formatINR(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
}
