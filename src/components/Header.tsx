export default function Header({ onGenerate }: { onGenerate: () => void }) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M7 4v6a4 4 0 0 0 4 4h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M14 10l3 3-3 3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14v3a3 3 0 0 0 3 3h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity=".55" />
            </svg>
          </span>
          <span className="text-[17px] font-800 font-extrabold tracking-tight text-slate-900">
            Split<span className="text-violet-700">UPI</span>
          </span>
          <span className="ml-1 hidden rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 sm:inline">
            No signup required
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-[14px] font-medium text-slate-600 md:flex">
          <a href="#generator" className="transition hover:text-slate-900">Generator</a>
          <a href="#how" className="transition hover:text-slate-900">How it works</a>
          <a href="#privacy" className="transition hover:text-slate-900">Privacy</a>
          <a href="#faq" className="transition hover:text-slate-900">FAQ</a>
        </nav>
        <button
          onClick={onGenerate}
          className="rounded-xl bg-slate-900 px-4 py-2 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-slate-700 active:scale-[.98]"
        >
          Generate QR Codes
        </button>
      </div>
    </header>
  );
}
