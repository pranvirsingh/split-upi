export default function Header({ onGenerate }: { onGenerate: () => void }) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-night/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-moss to-gold text-night shadow-lg shadow-black/40">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M7 4v6a4 4 0 0 0 4 4h6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M14 10l3 3-3 3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-mono text-[15px] font-bold tracking-tight text-mist">
            split<span className="text-gold">upi</span>
          </span>
          <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-faint sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            on-device
          </span>
        </a>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[11px] text-faint md:inline">v1.2</span>
          <button
            onClick={onGenerate}
            className="rounded-lg bg-gold px-4 py-2 font-mono text-[13px] font-bold text-night shadow-sm transition hover:brightness-110 active:scale-[.98]"
          >
            $ generate
          </button>
        </div>
      </div>
    </header>
  );
}
