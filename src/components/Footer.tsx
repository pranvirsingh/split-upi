import Disclaimer from './Disclaimer';

export default function Footer() {
  return (
    <footer className="no-print mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 md:pb-12">
      <div className="grid gap-6 md:grid-cols-2">
        <div id="privacy" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <p className="flex items-center gap-2 text-[15px] font-extrabold text-slate-900">
            <span aria-hidden>🔒</span> Privacy by design
          </p>
          <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-slate-600">
            <li>• QR codes and UPI links are generated on your device whenever possible.</li>
            <li>• Your UPI ID, name and amounts are not permanently stored by default.</li>
            <li>• Nothing here processes or holds money — SplitUPI only creates standard UPI payment instructions.</li>
            <li>• We never ask for your UPI PIN, OTP, card details, or banking passwords.</li>
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <Disclaimer />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[13px] font-bold text-slate-800">SplitUPI — Split one amount into multiple ready-to-pay UPI QR codes.</p>
            <p className="mt-1 text-[13px] text-slate-500">
              Payment happens in the payer&apos;s own UPI app. Built for freelancers, shopkeepers, and anyone collecting
              a fixed total in parts.
            </p>
            <p className="mt-3 text-[12px] text-slate-400">© {new Date().getFullYear()} SplitUPI • QR/deep-link generator only</p>
          </div>
        </div>
      </div>

      <div id="faq" className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-[17px] font-extrabold tracking-tight text-slate-900">Frequently asked</h3>
        <div className="mt-4 grid gap-5 text-[13.5px] leading-relaxed text-slate-600 md:grid-cols-3">
          <div>
            <p className="font-bold text-slate-800">Does SplitUPI move money?</p>
            <p className="mt-1">No. It only generates standard UPI QR codes and deep links. The payer pays inside their own UPI app.</p>
          </div>
          <div>
            <p className="font-bold text-slate-800">Do the parts always add up exactly?</p>
            <p className="mt-1">Yes. Splitting uses integer-paise math, so ₹4,500 with max ₹1,999 always gives 1,999 + 1,999 + 502.</p>
          </div>
          <div>
            <p className="font-bold text-slate-800">Are the presets official limits?</p>
            <p className="mt-1">No. ₹499/₹999/₹1,999/₹4,999 are convenience options only. Your bank or UPI app decides real limits and fees.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
