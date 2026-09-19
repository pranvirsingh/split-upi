import { useState } from 'react';
import QRCodeCard from './QRCodeCard';
import { formatINR } from '../lib/format';
import { buildUpiUri } from '../lib/upi';
import { previewLine } from '../lib/profiles';
import { isNative, shareMultipleImages } from '../lib/native';
import { copyText, downloadBrandedQr, shareText } from '../lib/download';

export interface GeneratedPayment {
  amount: number;
  uri: string;
  qr: string;
}

export interface SplitPreview {
  parts: number[];
  total: number;
  max: number;
  suggestion: { max: number; parts: number[] } | null;
}

interface Props {
  generated: GeneratedPayment[] | null;
  total: number | null;
  maxPerQr: number | null;
  upiId: string;
  receiverName: string;
  note: string;
  preview: SplitPreview | null;
  onApplyMax: (max: number) => void;
}

export default function PaymentSummary({ generated, total, maxPerQr, upiId, receiverName, note, preview, onApplyMax }: Props) {
  const [busy, setBusy] = useState<string>('');

  if (!generated || total === null || maxPerQr === null) {
    return (
      <div className="grid place-items-center px-6 py-10 text-center">
        <div className="w-full max-w-sm">
          {preview ? (
            <>
              <p className="font-mono text-[11px] text-faint">$ preview — live</p>
              <p className="mt-2 font-mono text-[14px] text-mist">-&gt; {previewLine(preview.parts, formatINR)}</p>
              <p className="mt-1 font-mono text-[11.5px] text-faint">
                = {preview.parts.length} pkts · ₹{formatINR(preview.total)}
              </p>
              {preview.suggestion && (
                <button
                  onClick={() => onApplyMax(preview.suggestion!.max)}
                  className="mt-3 rounded-md border border-gold/50 bg-gold/10 px-3 py-2 font-mono text-[11.5px] font-bold text-gold transition hover:bg-gold/20 active:scale-95"
                >
                  ! {preview.parts.length} pkts is payer-heavy — max {formatINR(preview.suggestion.max)} -&gt;{' '}
                  {preview.suggestion.parts.length} pkts · apply
                </button>
              )}
              {preview.parts.some((p) => p <= 1000) && (
                <p className="mt-2 font-mono text-[10.5px] text-faint/70">small parts can go PIN-less on payer UPI Lite</p>
              )}
            </>
          ) : (
            <>
              <p className="font-mono text-[13px] text-faint">
                <span className="text-gold">$</span> <span className="caret">awaiting input</span>
              </p>
              <p className="mt-3 font-mono text-[11.5px] leading-relaxed text-faint/70">
                4500 ÷ 1999 → 1,999 + 1,999 + 502
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const shareAllText = () => {
    const lines = generated.map(
      (g, i) => `${i + 1}) ₹${formatINR(g.amount)} — ${g.uri}`,
    );
    return `SplitUPI • ₹${formatINR(total)} in ${generated.length} payments\nTo: ${receiverName} (${upiId})${note.trim() ? `\nNote: ${note.trim()}` : ''}\n\n${lines.join('\n')}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-white/10 pb-3 font-mono text-[12px]">
        <span className="text-faint">
          total <span className="font-bold text-gold">₹{formatINR(total)}</span>
        </span>
        <span className="text-faint">
          pkts <span className="font-bold text-mist">{generated.length}</span>
        </span>
        <span className="text-faint">
          max <span className="font-bold text-mist">₹{formatINR(maxPerQr)}</span>
        </span>
        <span className="ml-auto flex gap-1.5">
          <button
            onClick={() => window.print()}
            title="Print All"
            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] font-bold text-mist transition hover:border-gold/50 hover:text-gold active:scale-95"
          >
            ⎙
          </button>
          <button
            onClick={async () => {
              if (isNative()) {
                // One system sheet with every QR — anchor downloads don't work in the app shell.
                setBusy('downloading');
                try {
                  const r = await shareMultipleImages(
                    generated.map((g, i) => ({
                      dataUrl: g.qr,
                      filename: `splitupi-${i + 1}-of-${generated.length}.png`,
                    })),
                  );
                  if (r === 'failed') alert('Share failed on this device.');
                } finally {
                  setBusy('');
                }
                return;
              }
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
            title="Download All"
            className="rounded-md bg-gold px-2.5 py-1.5 font-mono text-[11px] font-bold text-night transition hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            {busy === 'downloading' ? '…' : '⤓ all'}
          </button>
          <button
            onClick={async () => {
              const r = await shareText('SplitUPI payment summary', shareAllText());
              if (r === 'copied') alert('Payment summary copied to clipboard.');
              else if (r === 'unsupported') alert('Sharing is not supported on this device.');
            }}
            title="Share All"
            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] font-bold text-mist transition hover:border-gold/50 hover:text-gold active:scale-95"
          >
            ⇪
          </button>
          <button
            onClick={async () => {
              const all = generated.map((g) => g.uri).join('\n');
              const ok = await copyText(all);
              alert(ok ? 'All UPI links copied.' : 'Copy failed on this device.');
            }}
            title="Copy All Links"
            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] font-bold text-mist transition hover:border-gold/50 hover:text-gold active:scale-95"
          >
            ⧉
          </button>
        </span>
      </div>

      <div className="slim-scroll grid max-h-[720px] gap-3 overflow-y-auto pt-4 sm:grid-cols-2">
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
