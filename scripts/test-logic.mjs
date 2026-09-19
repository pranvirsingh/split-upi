// SplitUPI logic tests — mirrors src/lib/* implementation.
// Run: npm run test:logic
import assert from 'node:assert';

// ---- copy of splitAmount (paise integer math) ----
function splitAmount(totalAmount, maxPerPayment) {
  if (!Number.isFinite(totalAmount) || !Number.isFinite(maxPerPayment)) throw new Error('finite');
  if (totalAmount <= 0) throw new Error('Total amount must be greater than 0.');
  if (maxPerPayment <= 0) throw new Error('Maximum per QR must be greater than 0.');
  const totalPaise = Math.round(totalAmount * 100);
  const maxPaise = Math.round(maxPerPayment * 100);
  const parts = [];
  let rem = totalPaise;
  while (rem > maxPaise) { parts.push(maxPaise); rem -= maxPaise; }
  if (rem > 0) parts.push(rem);
  return parts.map((p) => Math.round(p) / 100);
}

function formatUpiAmount(a) { return (Math.round(a * 100) / 100).toFixed(2); }

function buildUpiUri({ upiId, receiverName, amount, note }) {
  const encPa = encodeURIComponent(upiId.trim()).replace(/%40/g, '@');
  let uri = `upi://pay?pa=${encPa}&pn=${encodeURIComponent(receiverName.trim())}&am=${encodeURIComponent(formatUpiAmount(amount))}&cu=INR`;
  if ((note ?? '').trim()) uri += `&tn=${encodeURIComponent(note.trim())}`;
  return uri;
}

const UPI_RE = /^[\w.\-]{2,}@[a-zA-Z]{2,}[\w.-]*$/;
function isValidUpiId(v) {
  const s = v.trim();
  if (!s || s.includes(' ') || (s.match(/@/g) || []).length !== 1) return false;
  return UPI_RE.test(s);
}

let pass = 0;
function eq(actual, expected, label) {
  assert.deepStrictEqual(actual, expected, `${label}: got ${JSON.stringify(actual)}`);
  console.log(`  ✓ ${label}`);
  pass++;
}

console.log('splitAmount cases:');
eq(splitAmount(4500, 1999), [1999, 1999, 502], '4500/1999 = 1999+1999+502');
eq(splitAmount(10000, 1999), [1999, 1999, 1999, 1999, 1999, 5], '10000/1999 = 5×1999+5');
eq(splitAmount(1999, 1999), [1999], '1999/1999 = 1999');
eq(splitAmount(1998, 1999), [1998], '1998/1999 = 1998');
eq(splitAmount(2000, 1999), [1999, 1], '2000/1999 = 1999+1');
eq(splitAmount(5997, 1999), [1999, 1999, 1999], '5997/1999 = 3×1999');
eq(splitAmount(1000, 1999), [1000], '1000/1999 = 1000');
eq(splitAmount(100.55, 50), [50, 50, 0.55], 'paise: 100.55/50 exact');

// sum integrity
for (const [t, m] of [[4500, 1999], [10000, 1999], [12345.67, 1999], [999.99, 499]]) {
  const parts = splitAmount(t, m);
  const sumPaise = parts.reduce((a, x) => a + Math.round(x * 100), 0);
  assert.strictEqual(sumPaise, Math.round(t * 100), `sum check ${t}/${m}`);
  assert.ok(parts.every((p) => p <= m + 1e-9), `cap check ${t}/${m}`);
  console.log(`  ✓ sum exact for ${t}/${m} → ${parts.length} parts`);
  pass++;
}

console.log('validation cases:');
assert.throws(() => splitAmount(0, 1999), /greater than 0/, '0 amount throws');
console.log('  ✓ 0 amount = validation error'); pass++;
assert.strictEqual(isValidUpiId('not-an-upi'), false, 'invalid upi rejected');
assert.strictEqual(isValidUpiId('example@upi'), true, 'valid upi accepted');
assert.strictEqual(isValidUpiId('98xxxxxx@okhdfc'), true, 'bank handle accepted');
console.log('  ✓ Invalid UPI ID = validation error'); pass++;

console.log('UPI URI cases:');
const uri = buildUpiUri({ upiId: 'example@upi', receiverName: 'Example Name', amount: 1999, note: 'Invoice 001' });
const expected = 'upi://pay?pa=example@upi&pn=Example%20Name&am=1999.00&cu=INR&tn=Invoice%20001';
assert.strictEqual(uri, expected, 'URI matches spec structure');
console.log(`  ✓ URI: ${uri}`); pass++;
const uri2 = buildUpiUri({ upiId: 'a@upi', receiverName: 'A B', amount: 502, note: '' });
assert.ok(uri2.includes('am=502.00') && !uri2.includes('&tn='), 'amount exact + empty note omitted');
console.log(`  ✓ URI amount exact, note omitted: ${uri2}`); pass++;

console.log(`\nAll ${pass} logic checks passed.`);
