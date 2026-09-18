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
    <div className="lift relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_12px_36px_-16px_rgba(28,24,19,.25)]">
      <div className="flex items-center justify-between bg-gradient-to-r from-forest/10 via-goldsoft to-transparent px-5 py-3">
        <p className="text-[13px] font-bold uppercase tracking-wide text-forest">
          Payment {index + 1} of {total}
        </p>
        <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-extrabold text-ink shadow-sm ring-1 ring-ink/10">
          ₹{formatINR(amount)}/-
        </span>
      </div>

      <div className="flex flex-col items-center px-5 pb-5 pt-4">
        <div className="grid w-full max-w-[280px] place-items-center rounded-2xl border border-ink/10 bg-white p-4 shadow-inner">
          {qr ? (
            <img src={qr} alt={`UPI QR for payment ${index + 1}`} className="qr-img h-52 w-52" width={208} height={208} />
          ) : (
            <div className="grid h-52 w-52 animate-pulse place-items-center rounded-xl bg-paper text-[13px] font-medium text-stone-400">
              Generating QR…
            </div>
          )}
        </div>

        <p className="mt-4 text-[22px] font-extrabold tracking-tight text-ink">₹{formatINR(amount)}/-</p>
        <p className="mt-0.5 max-w-full truncate text-[13.5px] font-medium text-stone-500" title={upiId}>
          {upiId}
        </p>
        {note.trim() && (
          <p className="mt-1 max-w-full truncate text-[12.5px] text-stone-400" title={note}>
            {note}
          </p>
        )}

        <div className="mt-4 grid w-full grid-cols-2 gap-2">
          <button
            onClick={async () => {
              await downloadBrandedQr({ index, total, amount, upiId, receiverName, note, uri });
              flash('PNG downloaded');
            }}
            className="rounded-xl bg-forest px-3 py-2.5 text-[13px] font-bold text-white transition hover:bg-pine active:scale-95"
          >
            Download PNG
          </button>
          <button
            onClick={async () => {
              const r = await shareText(
                `SplitUPI Payment ${index + 1} of ${total}`,
                `Pay ₹${formatINR(amount)} to ${receiverName} (${upiId}): ${uri}`,
              );
              flash(r === 'shared' ? 'Shared' : r === 'copied' ? 'Summary copied' : 'Share not supported');
            }}
            className="rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-[13px] font-bold text-stone-700 transition hover:border-forest/40 hover:text-forest active:scale-95"
          >
            Share
          </button>
        </div>
        <div className="mt-2 grid w-full grid-cols-2 gap-2">
          <button
            onClick={async () => {
              const ok = await copyText(uri);
              flash(ok ? 'UPI link copied' : 'Copy failed');
            }}
            className="rounded-xl border border-ink/10 bg-paper px-3 py-2.5 text-[13px] font-semibold text-stone-600 transition hover:border-forest/40 hover:text-forest active:scale-95"
          >
            Copy UPI Link
          </button>
          <a
            href={uri}
            className="grid place-items-center rounded-xl border border-forest/25 bg-[#edf3ee] px-3 py-2.5 text-center text-[13px] font-bold text-forest transition hover:bg-[#dfe9e0] active:scale-95"
          >
            Open in UPI app
          </a>
        </div>

        {toast && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
