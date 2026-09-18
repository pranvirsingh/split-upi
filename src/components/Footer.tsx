import { DISCLAIMER_TEXT } from '../lib/constants';

export default function Footer() {
  return (
    <footer className="no-print mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 md:pb-10">
      <div className="console overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 font-mono text-[11px] text-faint">
          <span>
            <span className="text-gold">splitupi</span> © {new Date().getFullYear()}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> on-device
          </span>
          <span className="ml-auto flex items-center gap-3">
            <a href="/privacy.html" className="underline decoration-gold/50 underline-offset-2 hover:text-mist">privacy</a>
            <span>qr/deep-link generator only</span>
          </span>
        </div>
        <div className="grid gap-px border-t border-white/10 bg-white/10 font-mono text-[11.5px] sm:grid-cols-3">
          <details className="console-details bg-night px-4 py-2.5">
            <summary className="text-mist">disclaimer</summary>
            <p className="pt-2 font-sans text-[12px] leading-relaxed text-faint">{DISCLAIMER_TEXT}</p>
          </details>
          <details className="console-details bg-night px-4 py-2.5">
            <summary className="text-mist">privacy</summary>
            <ul className="space-y-1 pt-2 font-sans text-[12px] leading-relaxed text-faint">
              <li>• Generated on your device. Nothing stored.</li>
              <li>• No money moves here. Never asks for PIN/OTP.</li>
            </ul>
          </details>
          <details className="console-details bg-night px-4 py-2.5">
            <summary className="text-mist">faq</summary>
            <div className="space-y-1.5 pt-2 font-sans text-[12px] leading-relaxed text-faint">
              <p><span className="text-mist">Move money?</span> No — QRs only.</p>
              <p><span className="text-mist">Exact sums?</span> Yes, paise-exact.</p>
              <p><span className="text-mist">Presets = limits?</span> No, convenience only.</p>
            </div>
          </details>
        </div>
      </div>
    </footer>
  );
}
