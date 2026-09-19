import { useState } from 'react';
import { buildUpiUri } from '../lib/upi';
import { formatINR } from '../lib/format';
import type { PayViewState } from '../lib/payview';

export default function PayView({ state }: { state: PayViewState }) {
  const [ticked, setTicked] = useState<Set<number>>(new Set());
  const total = state.parts.reduce((a, p) => a + p, 0);

  const toggle = (i: number) => {
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-xl bg-night px-4 py-8 text-mist">
      <p className="font-mono text-[12px] text-faint">
        <span className="font-bold text-gold">splitupi</span> · payer checklist
      </p>
      <h1 className="mt-2 text-[26px] font-black tracking-tight">
        ₹{formatINR(total)} <span className="text-faint">in {state.parts.length}</span>
      </h1>
      <p className="mt-1 font-mono text-[12px] text-faint">
        to {state.pn} ({state.pa}){state.tn ? ` · ${state.tn}` : ''}
      </p>
      <p className="mt-2 font-mono text-[12px] text-emerald-400">
        {ticked.size}/{state.parts.length} ticked
      </p>

      <div className="mt-5 space-y-2">
        {state.parts.map((amount, i) => {
          const done = ticked.has(i);
          const uri = buildUpiUri({ upiId: state.pa, receiverName: state.pn, amount, note: state.tn });
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                done ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-panel'
              }`}
            >
              <button
                onClick={() => toggle(i)}
                aria-label={done ? `Untick part ${i + 1}` : `Tick part ${i + 1}`}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border font-mono text-[13px] transition active:scale-90 ${
                  done ? 'border-emerald-400 bg-emerald-400 text-night' : 'border-white/20 text-transparent'
                }`}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <p className={`font-mono text-[15px] font-bold ${done ? 'text-faint line-through' : 'text-mist'}`}>
                  ₹{formatINR(amount)}
                </p>
                <p className="font-mono text-[10.5px] text-faint">part {i + 1} of {state.parts.length}</p>
              </div>
              <a
                href={uri}
                className="shrink-0 rounded-lg bg-gold px-4 py-2 font-mono text-[13px] font-bold text-night transition hover:brightness-110 active:scale-95"
              >
                Pay
              </a>
            </div>
          );
        })}
      </div>

      <p className="mt-5 font-mono text-[11px] leading-relaxed text-faint">
        Ticks are yours to track — always verify paid amounts in your bank/UPI app.
      </p>
      <a href="/" className="mt-3 inline-block font-mono text-[12px] text-gold underline underline-offset-4">
        Make your own split →
      </a>
    </div>
  );
}
