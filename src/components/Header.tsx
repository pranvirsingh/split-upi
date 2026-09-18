export default function Header({ onGenerate }: { onGenerate: () => void }) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-ink/10 bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-forest to-gold text-white shadow-lg shadow-forest/25">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M7 4v6a4 4 0 0 0 4 4h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M14 10l3 3-3 3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14v3a3 3 0 0 0 3 3h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity=".55" />
            </svg>
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-ink">
            Split<span className="text-forest">UPI</span>
          </span>
          <span className="ml-1 hidden rounded-full border border-gold/50 bg-goldsoft px-2 py-0.5 text-[11px] font-semibold text-[#7a5c0e] sm:inline">
            No signup
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-[14px] font-medium text-stone-500 md:flex">
          <a href="#generator" className="transition hover:text-ink">Generator</a>
          <a href="#how" className="transition hover:text-ink">How it works</a>
          <a href="#privacy" className="transition hover:text-ink">Privacy</a>
          <a href="#faq" className="transition hover:text-ink">FAQ</a>
        </nav>
        <button
          onClick={onGenerate}
          className="rounded-xl bg-forest px-4 py-2 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-pine active:scale-[.98]"
        >
          Generate QR Codes
        </button>
      </div>
    </header>
  );
}
