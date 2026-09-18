import { useCallback, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import PaymentForm from './components/PaymentForm';
import PaymentSummary, { type GeneratedPayment } from './components/PaymentSummary';
import Disclaimer from './components/Disclaimer';
import Footer from './components/Footer';
import { DEFAULT_MAX_PER_QR } from './lib/constants';
import { validateInputs, type PaymentInputs, type ValidationResult } from './lib/validation';
import { buildUpiUri } from './lib/upi';
import { qrDataUrl } from './lib/download';
import { formatINR } from './lib/format';

export default function App() {
  const [inputs, setInputs] = useState<PaymentInputs>({
    upiId: '',
    receiverName: '',
    totalAmount: '4500',
    maxPerQr: String(DEFAULT_MAX_PER_QR),
    note: '',
  });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [generated, setGenerated] = useState<GeneratedPayment[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const totals = useMemo(() => {
    if (!generated) return null;
    return generated.reduce((a, g) => a + g.amount, 0);
  }, [generated]);

  const handleGenerate = useCallback(async () => {
    const v = validateInputs(inputs);
    setValidation(v);
    if (!v.ok || !v.parts || v.total === undefined || v.max === undefined) {
      setGenerated(null);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setGenerating(true);
    try {
      const upiId = inputs.upiId.trim();
      const receiverName = inputs.receiverName.trim();
      const note = inputs.note.trim();
      const list: GeneratedPayment[] = await Promise.all(
        v.parts.map(async (amount) => {
          const uri = buildUpiUri({ upiId, receiverName, amount, note });
          const qr = await qrDataUrl(uri, 640);
          return { amount, uri, qr };
        }),
      );
      setGenerated(list);
      requestAnimationFrame(() => {
        if (window.innerWidth < 1024) summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } finally {
      setGenerating(false);
    }
  }, [inputs]);

  const scrollToForm = useCallback(() => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div id="top" className="min-h-screen">
      <Header onGenerate={scrollToForm} />

      {/* HERO */}
      <section className="hero-grid no-print border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-cream px-3.5 py-1.5 text-[12.5px] font-bold text-[#7a5c0e] shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-forest" />
              No signup • Works offline
            </span>
            <h1 className="mt-5 text-[38px] font-black leading-[1.05] tracking-tight text-ink sm:text-[56px]">
              One amount.
              <br />
              <span className="bg-gradient-to-r from-forest via-moss to-gold bg-clip-text text-transparent">
                Multiple UPI QR codes.
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-stone-500 sm:text-[18px]">
              Generate ready-to-pay UPI QR codes in seconds.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={scrollToForm}
                className="w-full rounded-2xl bg-forest px-8 py-4 text-[16px] font-bold text-white shadow-xl shadow-forest/30 transition hover:bg-pine active:scale-[.99] sm:w-auto"
              >
                Generate QR Codes
              </button>
              <a
                href="#how"
                className="w-full rounded-2xl border border-ink/15 bg-white px-8 py-4 text-center text-[15px] font-bold text-ink shadow-sm transition hover:border-ink/30 sm:w-auto"
              >
                See how it works
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-stone-500">
              <span>✓ Exact split</span>
              <span>✓ On-device QRs</span>
              <span>✓ Print • Share</span>
            </div>
          </div>
        </div>
      </section>

      {/* GENERATOR */}
      <main id="generator" className="no-print mx-auto max-w-6xl scroll-mt-20 px-4 pt-8 sm:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-[440px_1fr]">
          <div ref={formRef} className="scroll-mt-24 lg:sticky lg:top-24">
            <PaymentForm inputs={inputs} setInputs={setInputs} validation={validation} onGenerate={handleGenerate} />
            {generating && (
              <p className="mt-3 text-center text-[13px] font-semibold text-forest">Generating QR codes…</p>
            )}
          </div>
          <div ref={summaryRef} className="scroll-mt-24">
            <PaymentSummary
              generated={generated}
              total={generated && totals !== null ? totals : null}
              maxPerQr={generated ? Number(inputs.maxPerQr.replace(/,/g, '')) : null}
              upiId={inputs.upiId.trim()}
              receiverName={inputs.receiverName.trim()}
              note={inputs.note}
            />
            <div className="mt-4">
              <Disclaimer />
            </div>
          </div>
        </div>

        {/* HOW IT WORKS / SEO LANDING */}
        <section id="how" className="mt-12 scroll-mt-24 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-10">
          <h2 className="text-center text-[24px] font-black tracking-tight text-ink sm:text-[30px]">
            Split a total into ready-to-pay QR codes
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[14.5px] leading-relaxed text-stone-500">
            Enter your UPI ID, name, and total. SplitUPI divides it into exact-amount QR codes —
            payers scan and pay in their own UPI app.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { t: '1. Enter details', d: 'UPI ID, name, total, max per QR, optional note.', i: '⌨️' },
              { t: '2. Get exact QRs', d: '₹4,500 ÷ ₹1,999 → 1,999 + 1,999 + 502. Exact to the paise.', i: '✂️' },
              { t: '3. Share or print', d: 'Branded PNGs, UPI links, share, or a clean print sheet.', i: '🖨️' },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-ink/10 bg-paper p-5">
                <div className="text-2xl">{c.i}</div>
                <p className="mt-2 text-[15px] font-extrabold text-ink">{c.t}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-stone-500">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-[12.5px] font-semibold text-stone-500">
            {['upi://pay links', 'No PIN / OTP asked', 'PWA installable', 'Print mode'].map(
              (t) => (
                <span key={t} className="rounded-full border border-ink/10 bg-white px-3 py-1.5 shadow-sm">
                  {t}
                </span>
              ),
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* STICKY MOBILE CTA */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream/90 p-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full rounded-2xl bg-forest px-6 py-3.5 text-[15.5px] font-bold text-white shadow-xl shadow-forest/30 transition hover:bg-pine active:scale-[.99] disabled:opacity-70"
        >
          {generating ? 'Generating…' : generated ? `Regenerate QR Codes (${generated.length})` : 'Generate QR Codes'}
        </button>
      </div>

      {/* PRINT SHEET */}
      {generated && (
        <div id="print-area">
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>SplitUPI — Payment QR Codes</h1>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>
                  {inputs.receiverName.trim()} • {inputs.upiId.trim()}
                  {inputs.note.trim() ? ` • ${inputs.note.trim()}` : ''} • Total ₹
                  {formatINR(generated.reduce((a, g) => a + g.amount, 0))} in {generated.length} payments
                </p>
              </div>
              <p style={{ fontSize: 12, color: '#777' }}>{new Date().toLocaleDateString('en-IN')}</p>
            </div>
            {generated.map((g, i) => (
              <div className="print-card" key={i} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <img src={g.qr} alt={`Payment ${i + 1} QR`} style={{ width: 220, height: 220 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#173b2e', margin: 0 }}>
                    PAYMENT {i + 1} OF {generated.length}
                  </p>
                  <p style={{ fontSize: 30, fontWeight: 900, margin: '6px 0' }}>
                    ₹{formatINR(g.amount)}/-
                  </p>
                  <p style={{ fontSize: 14, margin: 0 }}>{inputs.receiverName.trim()}</p>
                  <p style={{ fontSize: 13, color: '#555', margin: '2px 0' }}>{inputs.upiId.trim()}</p>
                  {inputs.note.trim() && <p style={{ fontSize: 12, color: '#666', margin: '2px 0' }}>Note: {inputs.note.trim()}</p>}
                  <p style={{ fontSize: 10, color: '#888', margin: '6px 0 0', wordBreak: 'break-all' }}>{g.uri}</p>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 11, color: '#888', marginTop: 12 }}>
              SplitUPI generates UPI payment QR codes for convenience. It does not process payments or guarantee
              avoidance of any bank, UPI app, merchant, platform, or payment-provider fees, limits, or policies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
