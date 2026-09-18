import { useState } from 'react';
import QRCodeCard from './QRCodeCard';
import { formatINR } from '../lib/format';
import { buildUpiUri } from '../lib/upi';
import { copyText, downloadBrandedQr, shareText } from '../lib/download';

export interface GeneratedPayment {
  amount: number;
  uri: string;
  qr: string;
}

interface Props {
  generated: GeneratedPayment[] | null;
  total: number | null;
  maxPerQr: number | null;
  upiId: string;
  receiverName: string;
  note: string;
}

export default function PaymentSummary({ generated, total, maxPerQr, upiId, receiverName, note }: Props) {
  const [busy, setBusy] = useState<string>('');

  if (!generated || total === null || maxPerQr === null) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white/70">
        <div className="border-b border-slate-200/70 px-6 py-5 sm:px-8">
          <h2 className="text-[19px] font-extrabold tracking-tight text-slate-900">Payment Summary</h2>
          <p className="mt-1 text-[14px] text-slate-500">Your QR codes will appear here after generation.</p>
        </div>
        <div className="grid flex-1 place-items-center px-8 py-14 text-center">
          <div className="max-w-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-100 text-3xl">🧾</div>
            <p className="mt-5 text-[16px] font-bold text-slate-800">No QR codes yet</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-slate-500">
              Fill in your UPI details on the left and hit{' '}
              <span className="font-semibold text-slate-700">Generate QR Codes</span>. Example: ₹4,500 with max
              ₹1,999 → 1,999 + 1,999 + 502.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-left">
              {['Enter details', 'Generate', 'Share QRs'].map((s, i) => (
                <div key={s} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <p className="text-[11px] font-extrabold text-violet-600">STEP {i + 1}</p>
                  <p className="mt-0.5 text-[12.5px] font-semibold text-slate-700">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const shareAllText = () => {
    const lines = generated.map(
      (g, i) => `${i + 1}) ₹${formatINR(g.amount)} — ${g.uri}`,
    );
    return `SplitUPI collection • Total ₹${formatINR(total)} in ${generated.length} payments\nTo: ${receiverName} (${upiId})${note.trim() ? `\nNote: ${note.trim()}` : ''}\n\n${lines.join('\n')}`;
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-24px_rgba(76,29,149,.25)]">
      <div className="border-b border-slate-100 bg-gradient-to-b from-violet-50/70 to-white px-6 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[19px] font-extrabold tracking-tight text-slate-900">Payment Summary</h2>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
              <span className="text-slate-500">
                Total to collect:{' '}
                <span className="font-extrabold text-slate-900">₹{formatINR(total)}/-</span>
              </span>
              <span className="text-slate-500">
                QR Codes: <span className="font-extrabold text-slate-900">{generated.length}</span>
              </span>
              <span className="text-slate-500">
                Maximum per QR: <span className="font-extrabold text-slate-900">₹{formatINR(maxPerQr)}/-</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 active:scale-95"
          >
            ⎙ Print All
          </button>
        </div>
        <div className="no-print mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            onClick={async () => {
              setBusy('downloading');
              try {
                for (let i = 0; i < generated.length; i++) {
                  const g = generated[i];
                  await downloadBrandedQr({
                    index: i,
                    total: generated.length,
                    amount: g.amount,
                    upiId,
                    receiverName,
                    note,
                    uri: g.uri,
                  });
                  await new Promise((r) => setTimeout(r, 450));
                }
              } finally {
                setBusy('');
              }
            }}
            disabled={busy === 'downloading'}
            className="rounded-xl bg-violet-600 px-3 py-2.5 text-[13px] font-bold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-700 active:scale-95 disabled:opacity-60"
          >
            {busy === 'downloading' ? 'Downloading…' : 'Download All QR Codes'}
          </button>
          <button
            onClick={async () => {
              const r = await shareText('SplitUPI payment summary', shareAllText());
              if (r === 'copied') alert('Payment summary copied to clipboard.');
              else if (r === 'unsupported') alert('Sharing is not supported on this device — links were not copied.');
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 active:scale-95"
          >
            Share All
          </button>
          <button
            onClick={async () => {
              // Copy all links at once
              const all = generated.map((g) => g.uri).join('\n');
              const ok = await copyText(all);
              alert(ok ? 'All UPI links copied.' : 'Copy failed on this device.');
            }}
            className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] font-bold text-slate-600 transition hover:text-slate-900 sm:col-span-1"
          >
            Copy All Links
          </button>
        </div>
      </div>

      <div className="grid gap-4 bg-slate-50/60 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-2">
        {generated.map((g, i) => (
          <QRCodeCard
            key={`${g.uri}-${i}`}
            index={i}
            total={generated.length}
            amount={g.amount}
            upiId={upiId}
            receiverName={receiverName}
            note={note}
          />
        ))}
      </div>

      {/* Hidden helper to keep URIs verifiable */}
      <div className="hidden">
        {generated.map((g, i) => (
          <p key={i}>{buildUpiUri({ upiId, receiverName, amount: g.amount, note })}</p>
        ))}
      </div>
    </div>
  );
}
