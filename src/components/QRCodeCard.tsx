import { useEffect, useState } from 'react';
import { buildUpiUri } from '../lib/upi';
import { formatINR } from '../lib/format';
import { copyText, downloadBrandedQr, qrDataUrl, shareText } from '../lib/download';

interface Props {
  index: number;
  total: number;
  amount: number;
  upiId: string;
  receiverName: string;
  note: string;
}

export default function QRCodeCard({ index, total, amount, upiId, receiverName, note }: Props) {
  const [qr, setQr] = useState<string>('');
  const [toast, setToast] = useState<string>('');
  const uri = buildUpiUri({ upiId, receiverName, amount, note });

  useEffect(() => {
    let live = true;
    qrDataUrl(uri, 512).then((d) => live && setQr(d)).catch(() => {});
    return () => {
      live = false;
    };
  }, [uri]);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(''), 1800);
  };

  return (
    <div className="lift relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-night">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <p className="font-mono text-[11px] font-bold text-gold">
          pkt_{index + 1}/{total}
        </p>
        <span className="font-mono text-[12px] font-bold text-mist">₹{formatINR(amount)}</span>
      </div>

      <div className="flex flex-col items-center px-4 pb-4 pt-3">
        <div className="grid w-full max-w-[240px] place-items-center rounded-lg bg-white p-3">
          {qr ? (
            <img src={qr} alt={`UPI QR for payment ${index + 1}`} className="qr-img h-48 w-48" width={192} height={192} />
          ) : (
            <div className="grid h-48 w-48 animate-pulse place-items-center rounded bg-stone-100 font-mono text-[12px] text-stone-400">
              rendering…
            </div>
          )}
        </div>

        <p className="mt-3 font-mono text-[19px] font-bold tracking-tight text-mist">₹{formatINR(amount)}</p>
        <p className="mt-0.5 max-w-full truncate font-mono text-[11.5px] text-faint" title={upiId}>
          {upiId}
        </p>

        <div className="mt-3 grid w-full grid-cols-3 gap-1.5">
          <button
            onClick={async () => {
              const r = await downloadBrandedQr({ index, total, amount, upiId, receiverName, note, uri });
              flash(r === 'failed' ? 'failed' : r === 'shared' ? 'shared' : 'PNG downloaded');
            }}
            className="rounded-md bg-gold px-2 py-2 font-mono text-[11.5px] font-bold text-night transition hover:brightness-110 active:scale-95"
          >
            png
          </button>
          <button
            onClick={async () => {
              const r = await shareText(
                `SplitUPI Payment ${index + 1} of ${total}`,
                `Pay ₹${formatINR(amount)} to ${receiverName} (${upiId}): ${uri}`,
              );
              flash(r === 'shared' ? 'shared' : r === 'copied' ? 'copied' : 'n/a');
            }}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-2 font-mono text-[11.5px] font-bold text-mist transition hover:border-gold/50 hover:text-gold active:scale-95"
          >
            share
          </button>
          <button
            onClick={async () => {
              const ok = await copyText(uri);
              flash(ok ? 'copied' : 'failed');
            }}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-2 font-mono text-[11.5px] font-bold text-mist transition hover:border-gold/50 hover:text-gold active:scale-95"
          >
            copy
          </button>
        </div>
        <a
          href={uri}
          className="mt-1.5 w-full rounded-md border border-moss/60 bg-moss/20 px-2 py-2 text-center font-mono text-[11.5px] font-bold text-emerald-300 transition hover:bg-moss/30 active:scale-95"
        >
          open in upi app ↗
        </a>

        {toast && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-mist px-3.5 py-1.5 font-mono text-[12px] font-bold text-night shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
