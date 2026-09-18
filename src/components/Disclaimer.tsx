import { DISCLAIMER_TEXT } from '../lib/constants';

export default function Disclaimer() {
  return (
    <div className="rounded-2xl border border-amber-200/70 bg-amber-50 px-5 py-4">
      <p className="text-[12.5px] font-bold uppercase tracking-wide text-amber-800">Important disclaimer</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-amber-900/90">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
