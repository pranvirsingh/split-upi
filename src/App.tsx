import { useCallback, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import PaymentForm from './components/PaymentForm';
import PaymentSummary, { type GeneratedPayment } from './components/PaymentSummary';
import Footer from './components/Footer';
import { DEFAULT_MAX_PER_QR } from './lib/constants';
import { validateInputs, type PaymentInputs, type ValidationResult } from './lib/validation';
import { buildUpiUri } from './lib/upi';
import { qrDataUrl } from './lib/download';
import { formatINR } from './lib/format';

function Dots() {
  return (
    <span className="flex gap-1.5" aria-hidden>
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
    </span>
  );
}

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
    <div id="top" className="min-h-screen bg-night text-mist">
      <Header onGenerate={scrollToForm} />

      {/* MASTHEAD */}
      <section className="hero-grid no-print border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[12px] text-faint">~/ splitupi — upi qr splitter</p>
              <h1 className="mt-3 text-[36px] font-black leading-[1.05] tracking-tight sm:text-[50px]">
                One amount.
                <br />
                <span className="bg-gradient-to-r from-gold via-[#e8c85a] to-moss bg-clip-text text-transparent">
                  Multiple UPI QR codes.
                </span>
              </h1>
              <p className="mt-3 max-w-md text-[15px] text-faint">Ready-to-pay QR codes in seconds.</p>
              <div className="mt-6">
                <button
                  onClick={scrollToForm}
                  className="rounded-xl bg-gold px-7 py-3.5 font-mono text-[15px] font-bold text-night shadow-xl shadow-gold/20 transition hover:brightness-110 active:scale-[.99]"
                >
                  $ generate
                </button>
              </div>
            </div>
            <div className="console overflow-hidden rounded-2xl">
              <div className="console-bar flex items-center justify-between px-4 py-2.5">
                <Dots />
                <span className="font-mono text-[11px] text-faint">preview — exact split</span>
              </div>
              <div className="slim-scroll overflow-x-auto p-5 font-mono text-[13.5px] leading-[1.9]">
                <p className="whitespace-nowrap text-mist">
                  <span className="text-gold">$</span> split 4500 --max 1999
                </p>
                <p className="whitespace-nowrap text-faint">→ 1,999 + 1,999 + 502</p>
                <p className="whitespace-nowrap text-emerald-400">✓ total 4,500 exact</p>
                <p className="caret whitespace-nowrap text-mist">
                  <span className="text-gold">$</span>{' '}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONSOLE */}
      <main id="generator" className="no-print mx-auto max-w-6xl scroll-mt-20 px-4 pt-8 sm:px-6">
        <div className="console overflow-hidden rounded-2xl">
          <div className="console-bar flex items-center justify-between px-4 py-2.5">
            <Dots />
            <span className="font-mono text-[11px] text-faint">splitupi — console</span>
            <span className="hidden font-mono text-[11px] text-faint sm:inline">utf-8 · on-device</span>
          </div>
          <div className="grid lg:grid-cols-[400px_1fr]">
            <div ref={formRef} className="scroll-mt-24 border-b border-white/10 lg:border-b-0 lg:border-r">
              <p className="border-b border-white/10 px-5 py-2.5 font-mono text-[11.5px] text-gold">
                $ input — payment details
              </p>
              <div className="p-4 sm:p-5">
                <PaymentForm inputs={inputs} setInputs={setInputs} validation={validation} onGenerate={handleGenerate} />
                {generating && (
                  <p className="mt-3 text-center font-mono text-[12px] text-gold">working…</p>
                )}
              </div>
            </div>
            <div ref={summaryRef} className="scroll-mt-24">
              <p className="border-b border-white/10 px-5 py-2.5 font-mono text-[11.5px] text-gold">
                $ output — qr packets{generated ? ` (${generated.length})` : ''}
              </p>
              <div className="p-4 sm:p-5">
                <PaymentSummary
                  generated={generated}
                  total={generated && totals !== null ? totals : null}
                  maxPerQr={generated ? Number(inputs.maxPerQr.replace(/,/g, '')) : null}
                  upiId={inputs.upiId.trim()}
                  receiverName={inputs.receiverName.trim()}
                  note={inputs.note}
                />
              </div>
            </div>
          </div>
        </div>

        {/* STEPS */}
        <section className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {[
            ['01', 'enter', 'upi id · name · total'],
            ['02', 'split', 'paise-exact parts'],
            ['03', 'scan', 'pay in any upi app'],
          ].map(([n, t, d]) => (
            <div key={n} className="bg-night px-5 py-4">
              <p className="font-mono text-[12px]">
                <span className="text-gold">{n}</span> <span className="font-bold text-mist">{t}</span>
              </p>
              <p className="mt-1 font-mono text-[11.5px] text-faint">{d}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />

      {/* STICKY MOBILE CTA */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-night/90 p-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full rounded-xl bg-gold px-6 py-3.5 font-mono text-[15px] font-bold text-night shadow-xl transition active:scale-[.99] disabled:opacity-70"
        >
          {generating ? 'working…' : generated ? `$ regenerate (${generated.length})` : '$ generate'}
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
