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
    <div className="lift relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_36px_-16px_rgba(15,18,34,.25)]">
      <div className="flex items-center justify-between bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-transparent px-5 py-3">
        <p className="text-[13px] font-bold uppercase tracking-wide text-violet-800">
          Payment {index + 1} of {total}
        </p>
        <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-extrabold text-slate-900 shadow-sm ring-1 ring-slate-200">
          ₹{formatINR(amount)}/-
        </span>
      </div>

      <div className="flex flex-col items-center px-5 pb-5 pt-4">
        <div className="grid w-full max-w-[280px] place-items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
          {qr ? (
            <img src={qr} alt={`UPI QR for payment ${index + 1}`} className="qr-img h-52 w-52" width={208} height={208} />
          ) : (
            <div className="grid h-52 w-52 animate-pulse place-items-center rounded-xl bg-slate-100 text-[13px] font-medium text-slate-400">
              Generating QR…
            </div>
          )}
        </div>

        <p className="mt-4 text-[22px] font-extrabold tracking-tight text-slate-900">₹{formatINR(amount)}/-</p>
        <p className="mt-0.5 max-w-full truncate text-[13.5px] font-medium text-slate-500" title={upiId}>
          {upiId}
        </p>
        {note.trim() && (
          <p className="mt-1 max-w-full truncate text-[12.5px] text-slate-400" title={note}>
            {note}
          </p>
        )}

        <div className="mt-4 grid w-full grid-cols-2 gap-2">
          <button
            onClick={async () => {
              await downloadBrandedQr({ index, total, amount, upiId, receiverName, note, uri });
              flash('PNG downloaded');
            }}
            className="rounded-xl bg-slate-900 px-3 py-2.5 text-[13px] font-bold text-white transition hover:bg-slate-700 active:scale-95"
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 active:scale-95"
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
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700 active:scale-95"
          >
            Copy UPI Link
          </button>
          <a
            href={uri}
            className="grid place-items-center rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-center text-[13px] font-bold text-violet-700 transition hover:bg-violet-100 active:scale-95"
          >
            Open in UPI app
          </a>
        </div>

        {toast && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
