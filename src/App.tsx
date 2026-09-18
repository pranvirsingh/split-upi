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
      <section className="hero-grid no-print border-b border-slate-200/70">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-violet-700 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              No signup required • Works offline after first load
            </span>
            <h1 className="mt-5 text-[38px] font-black leading-[1.05] tracking-tight text-slate-900 sm:text-[56px]">
              One amount.
              <br />
              <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Multiple UPI QR codes.
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-slate-500 sm:text-[18px]">
              Generate ready-to-pay UPI QR codes in seconds.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={scrollToForm}
                className="w-full rounded-2xl bg-gradient-to-b from-violet-600 to-indigo-700 px-8 py-4 text-[16px] font-bold text-white shadow-xl shadow-violet-600/30 transition hover:brightness-110 active:scale-[.99] sm:w-auto"
              >
                Generate QR Codes
              </button>
              <a
                href="#how"
                className="w-full rounded-2xl border border-slate-300 bg-white px-8 py-4 text-center text-[15px] font-bold text-slate-700 shadow-sm transition hover:border-slate-400 sm:w-auto"
              >
                See how it works
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-slate-500">
              <span>✓ Exact split — totals always match</span>
              <span>✓ Client-side QR generation</span>
              <span>✓ Print • Download • Share</span>
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
              <p className="mt-3 text-center text-[13px] font-semibold text-violet-700">Generating QR codes…</p>
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
        <section id="how" className="mt-12 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h2 className="text-center text-[24px] font-black tracking-tight text-slate-900 sm:text-[30px]">
            Split a total into ready-to-pay QR codes
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[14.5px] leading-relaxed text-slate-500">
            Enter your UPI ID, receiver name, and the full amount you want to collect. SplitUPI divides it into
            multiple standard UPI payment QR codes — each with its exact amount encoded. Payers simply scan and pay in
            their own UPI app.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { t: '1. Enter payment details', d: 'Your UPI ID, receiver name, total amount, max per QR, and an optional note like “Invoice 001”.', i: '⌨️' },
              { t: '2. Get exact-split QRs', d: '₹4,500 with max ₹1,999 becomes 1,999 + 1,999 + 502. Integer-paise math means the sum always matches exactly.', i: '✂️' },
              { t: '3. Download, share, print', d: 'Download branded PNGs, copy UPI links, share via the Web Share API, or print a clean sheet for your counter.', i: '🖨️' },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="text-2xl">{c.i}</div>
                <p className="mt-2 text-[15px] font-extrabold text-slate-900">{c.t}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-[12.5px] font-semibold text-slate-500">
            {['upi://pay standard links', 'URL-encoded params', 'No PIN / OTP ever asked', 'PWA installable', 'Mobile-first + print mode'].map(
              (t) => (
                <span key={t} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                  {t}
                </span>
              ),
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* STICKY MOBILE CTA */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 p-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full rounded-2xl bg-gradient-to-b from-violet-600 to-indigo-700 px-6 py-3.5 text-[15.5px] font-bold text-white shadow-xl shadow-violet-600/30 transition active:scale-[.99] disabled:opacity-70"
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
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#6d28d9', margin: 0 }}>
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
