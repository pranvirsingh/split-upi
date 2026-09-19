import { isNative } from '../lib/native';
import { APP_VERSION } from '../lib/update';

function Mark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#133026" />
      <rect x="17" y="17" width="13" height="13" rx="3" fill="#ece7d9" />
      <rect x="34" y="17" width="13" height="13" rx="3" fill="#ece7d9" />
      <rect x="17" y="34" width="13" height="13" rx="3" fill="#ece7d9" />
      <rect x="35.5" y="35.5" width="13" height="13" rx="3" fill="#d3a62c" />
    </svg>
  );
}

export default function Header({ onGenerate, hasUpdate }: { onGenerate: () => void; hasUpdate: boolean }) {
  if (isNative()) {
    return (
      <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-night/95 backdrop-blur-xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2.5 px-4">
          <Mark />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-mono text-[15px] font-bold text-mist">
              split<span className="text-gold">upi</span>
            </p>
            <p className="font-mono text-[10px] text-faint">v{APP_VERSION} · on-device</p>
          </div>
          {hasUpdate && <span className="h-2 w-2 animate-pulse rounded-full bg-gold" title="Update available" />}
          <button
            onClick={onGenerate}
            className="rounded-lg bg-gold px-4 py-2 font-mono text-[13px] font-bold text-night shadow-sm transition hover:brightness-110 active:scale-[.98]"
          >
            $ generate
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-night/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <Mark size={32} />
          <span className="font-mono text-[15px] font-bold tracking-tight text-mist">
            split<span className="text-gold">upi</span>
          </span>
          <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-faint sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            on-device
          </span>
        </a>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 font-mono text-[11px] text-faint md:inline-flex">
            v{APP_VERSION}
            {hasUpdate && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" title="Update available" />}
          </span>
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
