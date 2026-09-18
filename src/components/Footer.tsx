import Disclaimer from './Disclaimer';

export default function Footer() {
  return (
    <footer className="no-print mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 md:pb-12">
      <div className="grid gap-6 md:grid-cols-2">
        <div id="privacy" className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-7">
          <p className="flex items-center gap-2 text-[15px] font-extrabold text-ink">
            <span aria-hidden>🔒</span> Privacy by design
          </p>
          <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-600">
            <li>• QRs are generated on your device. Nothing is stored.</li>
            <li>• No money moves here — only payment instructions.</li>
            <li>• Never asks for UPI PIN, OTP, or bank passwords.</li>
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <Disclaimer />
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm">
            <p className="text-[13px] font-bold text-ink">SplitUPI — one amount, multiple ready-to-pay UPI QR codes.</p>
            <p className="mt-1 text-[13px] text-stone-500">
              For freelancers, shops, anyone collecting a fixed total in parts.
            </p>
            <p className="mt-3 text-[12px] text-stone-400">© {new Date().getFullYear()} SplitUPI</p>
          </div>
        </div>
      </div>

      <div id="faq" className="mt-6 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-[17px] font-extrabold tracking-tight text-ink">FAQ</h3>
        <div className="mt-4 grid gap-5 text-[13.5px] leading-relaxed text-stone-600 md:grid-cols-3">
          <div>
            <p className="font-bold text-ink">Does it move money?</p>
            <p className="mt-1">No. It makes QR codes and links. Payers pay in their own UPI app.</p>
          </div>
          <div>
            <p className="font-bold text-ink">Do parts add up exactly?</p>
            <p className="mt-1">Yes — paise-exact math. ₹4,500 ÷ ₹1,999 → 1,999 + 1,999 + 502.</p>
          </div>
          <div>
            <p className="font-bold text-ink">Are presets official limits?</p>
            <p className="mt-1">No, convenience options only. Real limits come from your bank or UPI app.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
